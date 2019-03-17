import { normalize, schema, Schema } from 'normalizr';
import mapValues from '../utils/mapValues';
import {
  IDerivedSchemasMap,
  IEndpointResolver,
  IModel,
  IModelDefinition,
  IModelRequest,
  IModelResponse,
  ISchemaDerivative,
  ISchemaCreator,
  IReferenceResolverCreator,
} from './Model.interface';

const createDerivedSchemas = (
  modelName: string,
  itemSchema: Schema,
  derivedSchemasConfig: ISchemaDerivative[],
  createReferenceResolver: IReferenceResolverCreator,
) =>
  derivedSchemasConfig.reduce<IDerivedSchemasMap>(
    (derivedSchemasInterim, { schemaName, schemaCreator }) => {
      derivedSchemasInterim[schemaName] = schemaCreator(
        createReferenceResolver({
          defaultModel: modelName,
          itemSchema,
          derivedSchemas: derivedSchemasInterim,
        }),
      );
      return derivedSchemasInterim;
    },
    {},
  );

export default class Model implements IModel {
  readonly modelName: string;
  protected readonly itemSchema: Schema;
  protected readonly derivedSchemas: IDerivedSchemasMap;
  private readonly endpointResolver: IEndpointResolver | string;

  constructor(
    definition: IModelDefinition,
    referenceResolverCreator: IReferenceResolverCreator,
  ) {
    const {
      modelName,
      derivedSchemas: derivedSchemasConfig = [],
      schema: {
        definition: itemSchemaDefinition = {},
        options: itemSchemaOptions = {},
      } = {},
      toClientAdapter,
      endpointResolver,
    } = definition;

    this.modelName = modelName;
    this.endpointResolver = endpointResolver;

    const reference = referenceResolverCreator();
    const schemaDefinition = mapValues(
      itemSchemaDefinition,
      (schemaCreator: ISchemaCreator) => schemaCreator(reference),
    );

    this.itemSchema = new schema.Entity(modelName, schemaDefinition, {
      ...itemSchemaOptions,
      processStrategy: toClientAdapter,
    });

    this.derivedSchemas = createDerivedSchemas(
      this.modelName,
      this.itemSchema,
      derivedSchemasConfig,
      referenceResolverCreator,
    );
  }

  resolveEntitySchema() {
    return this.itemSchema;
  }

  resolveSchemaByName(schemaName: string): Schema {
    const schema = this.derivedSchemas[schemaName];
    if (!schema) {
      throw new Error(
        `schema ${schemaName} is not specified for ${this.modelName}`,
      );
    }
    return schema;
  }

  resolveSchemaFromRequest(request: IModelRequest): Schema {
    const { query: { id = undefined } = {}, applicableSchemaName } = request;

    if (applicableSchemaName) {
      return this.resolveSchemaByName(applicableSchemaName);
    }
    if (!id) {
      return this.resolveSchemaByName('list');
    }
    return this.itemSchema;
  }

  normalize(request: IModelRequest, response: IModelResponse) {
    return normalize(response, this.resolveSchemaFromRequest(request));
  }

  resolveEndpoint = (request: IModelRequest) => {
    return typeof this.endpointResolver === 'string'
      ? this.endpointResolver
      : this.endpointResolver(request);
  };
}
