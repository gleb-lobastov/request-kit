// eslint-disable-next-line no-unused-vars
import { normalize, denormalize, schema, Schema } from 'normalizr';
import mapValues from '../utils/mapValues';
/* eslint-disable no-unused-vars */
import {
  TModelDefinition,
  TReferenceResolverCreator,
  TEndpointResolver,
  TToServerAdapter,
  TModelResponse,
  TSchemaCreator,
  TSchemaDerivative,
} from './Model.interface';
import { TModelRequirements } from '../interface';
/* eslint-enable no-unused-vars */

const createDerivedSchemas = (
  modelName: string,
  itemSchema: Schema,
  derivedSchemasConfig: TSchemaDerivative[],
  createReferenceResolver: TReferenceResolverCreator,
) =>
  derivedSchemasConfig.reduce<{ [key: string]: Schema }>(
    (
      derivedSchemasInterim,
      { schemaName, schemaCreator }: TSchemaDerivative,
    ) => {
      // eslint-disable-next-line
      derivedSchemasInterim[schemaName] = schemaCreator(
        createReferenceResolver({
          defaultModel: modelName,
          itemSchema,
          derivedSchemas: derivedSchemasInterim,
        }),
        modelName,
      );
      return derivedSchemasInterim;
    },
    {},
  );

export default class Model<TRequirements> {
  modelName: string;
  adaptToServer: TToServerAdapter;
  endpointResolver: TEndpointResolver | string;
  itemSchema: Schema;
  nonNestedItemSchema: Schema;
  derivedSchemas: { [key: string]: Schema };
  nonNestedDerivedSchemas: { [key: string]: Schema };

  constructor(
    definition: TModelDefinition,
    referenceResolverCreator: TReferenceResolverCreator,
  ) {
    const {
      modelName,
      derivedSchemas: derivedSchemasConfig = [],
      schema: {
        definition: itemSchemaDefinition = {},
        options: itemSchemaOptions = {},
      } = {},
      toClientAdapter,
      toServerAdapter,
      endpointResolver,
    } = definition;

    this.modelName = modelName;
    this.endpointResolver = endpointResolver;
    this.adaptToServer = toServerAdapter;

    const reference = referenceResolverCreator(/* nothing to pass */);
    const schemaDefinition = mapValues(
      itemSchemaDefinition,
      (schemaCreator: TSchemaCreator) => schemaCreator(reference, modelName),
    );

    this.itemSchema = new schema.Entity(modelName, schemaDefinition, {
      ...itemSchemaOptions,
      processStrategy: toClientAdapter,
    });
    this.nonNestedItemSchema = new schema.Entity(
      modelName,
      {},
      {
        ...itemSchemaOptions,
        processStrategy: toClientAdapter,
      },
    );

    this.derivedSchemas = createDerivedSchemas(
      this.modelName,
      this.itemSchema,
      derivedSchemasConfig,
      referenceResolverCreator,
    );
    this.nonNestedDerivedSchemas = createDerivedSchemas(
      this.modelName,
      this.nonNestedItemSchema,
      derivedSchemasConfig,
      referenceResolverCreator,
    );
  }

  resolveEntitySchema(): Schema {
    return this.itemSchema;
  }

  resolveSchemaByName(
    schemaName: string,
    shouldUseNonNestedSchemas: boolean,
  ): Schema {
    const schemas = shouldUseNonNestedSchemas
      ? this.nonNestedDerivedSchemas
      : this.derivedSchemas;
    const resolvedSchema = schemas[schemaName];
    if (!resolvedSchema) {
      throw new Error(
        `schema ${schemaName} is not specified for ${this.modelName}`,
      );
    }
    return resolvedSchema;
  }

  resolveSchemaFromRequest(
    request: TModelRequirements<TRequirements>,
    shouldUseNonNestedSchemas: boolean,
  ): Schema {
    const {
      isProvision,
      query: { id = undefined } = {},
      applicableSchemaName,
    } = request;

    if (applicableSchemaName) {
      return this.resolveSchemaByName(
        applicableSchemaName,
        shouldUseNonNestedSchemas,
      );
    }
    if (isProvision && !id) {
      return this.resolveSchemaByName('list', shouldUseNonNestedSchemas);
    }
    return shouldUseNonNestedSchemas
      ? this.nonNestedItemSchema
      : this.itemSchema;
  }

  normalize(
    request: TModelRequirements<TRequirements>,
    response: TModelResponse,
  ) {
    return normalize(response, this.resolveSchemaFromRequest(request, false));
  }

  denormalize(
    request: TModelRequirements<TRequirements>,
    result: TModelResponse,
    entities: any,
  ) {
    return denormalize(
      result,
      this.resolveSchemaFromRequest(request, true),
      entities,
    );
  }

  resolveEndpoint = (request: TModelRequirements<TRequirements>): string =>
    typeof this.endpointResolver === 'string'
      ? this.endpointResolver
      : this.endpointResolver(request);

  resolveToServerAdapter(): TToServerAdapter {
    return this.adaptToServer;
  }
}
