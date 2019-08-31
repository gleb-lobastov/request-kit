import { TModelRequest, TModelResponsePromise } from './Model';
import { TModelDefinitions } from './ModelsSet';

export interface TRequestHandler {
  (request: TModelRequest, ...args: any[]): TModelResponsePromise;
}

export interface TCustomRequest {}

export interface TModelConfig {
  modelsDefinitions: TModelDefinitions;
}

export interface TModelQuery {
  id?: number | string;
}

interface TModelRequirementsWithName {
  modelName: string;
  key?: string;
}

interface TModelRequirementsWithKey {
  modelName?: string;
  key: string;
}

type TModelRequirementsOptional =
  | TModelRequirementsWithKey
  | TModelRequirementsWithName
  | (TModelRequirementsWithName & TModelRequirementsWithKey);

export type TModelRequirements<TRequirements> = TRequirements &
  TModelRequirementsOptional & {
    isProvision?: boolean;
    query?: TModelQuery;
    applicableSchemaName?: string;
  };

export interface TMiddleware {
  (...args: any[]): any;
}
