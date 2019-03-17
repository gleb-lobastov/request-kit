import { schema, Schema } from 'normalizr';

export interface IDerivedSchemasMap {
  [key: string]: Schema;
}

export interface IEndpointResolver {
  (params: IModelRequest): string;
}

export interface IReferenceDeterminant {
  modelName?: string;
  schemaName?: string;
}

export interface IReferenceResolver {
  (referenceDeterminant: IReferenceDeterminant): Schema | undefined;
}

export interface IReferenceResolverCreatorConfig {
  defaultModel?: string;
  itemSchema?: Schema;
  derivedSchemas?: IDerivedSchemasMap;
}

export interface IReferenceResolverCreator {
  (config?: IReferenceResolverCreatorConfig): IReferenceResolver;
}

export interface ISchemaCreator {
  (reference: IReferenceResolver): Schema;
}

export interface ISchemaDerivative {
  schemaName: string;
  schemaCreator: ISchemaCreator;
}

type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;

export interface ISchemaConfig {
  definition?: { [key: string]: ISchemaCreator };
  options?: Omit<schema.EntityOptions, 'processStrategy'>;
}

export interface IModelDefinition {
  modelName: string;
  derivedSchemas?: ISchemaDerivative[];
  schema?: ISchemaConfig;
  toClientAdapter: schema.EntityOptions['processStrategy'];
  endpointResolver: IEndpointResolver | string;
}

export interface IModelQuery {
  id?: number | string;
}

export interface IModelRequest {
  query?: IModelQuery;
  applicableSchemaName?: string;
  modelName: string;
}
export interface IModelResponse {}

export interface IModelResponsePromise extends Promise<IModelResponse> {}

export interface IModel {
  resolveEntitySchema: () => Schema;
  normalize: (
    request: IModelRequest,
    response: IModelResponse,
  ) => {
    entities: any;
    result: any;
  };
  resolveEndpoint: IEndpointResolver;
  resolveSchemaByName: (schemaName: string) => Schema;
  resolveSchemaFromRequest: (request: IModelRequest) => Schema;
}
