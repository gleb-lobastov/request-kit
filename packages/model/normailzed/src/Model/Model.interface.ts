// eslint-disable-next-line no-unused-vars
import { schema, Schema } from 'normalizr';

export interface TDerivedSchemasMap {
  [key: string]: Schema;
}

export interface TEndpointResolver {
  (params: any): string;
}

export interface TReferenceDeterminant {
  modelName?: string;
  schemaName?: string;
}

export interface TReferenceResolver {
  (referenceDeterminant: TReferenceDeterminant): Schema | undefined;
}

export interface TReferenceResolverCreatorConfig {
  defaultModel?: string;
  itemSchema?: Schema;
  derivedSchemas?: TDerivedSchemasMap;
  isNoop?: boolean;
}

export interface TReferenceResolverCreator {
  (config?: TReferenceResolverCreatorConfig): TReferenceResolver;
}

export interface TSchemaCreator {
  (reference: TReferenceResolver, modelName: string): Schema;
}

export interface TSchemaDerivative {
  schemaName: string;
  schemaCreator: TSchemaCreator;
}

type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;

export interface TSchemaConfig {
  definition?: { [key: string]: TSchemaCreator };
  options?: Omit<schema.EntityOptions, 'processStrategy'>;
}

export interface TToServerAdapter {
  (clientFormat: {}): {};
}

export interface TModelDefinition {
  modelName: string;
  derivedSchemas?: TSchemaDerivative[];
  schema?: TSchemaConfig;
  toClientAdapter: schema.EntityOptions['processStrategy'];
  toServerAdapter: TToServerAdapter;
  endpointResolver: TEndpointResolver | string;
}

export interface TModelQuery {
  id?: number | string;
}

export interface TModelRequest {
  isProvision?: boolean;
  query?: TModelQuery;
  applicableSchemaName?: string;
  modelName: string;
}
export interface TModelResponse {}

export interface TModelResponsePromise extends Promise<TModelResponse> {}
