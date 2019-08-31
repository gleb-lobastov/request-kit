// eslint-disable-next-line no-unused-vars
import Model, { TModelDefinition } from '../Model';

export interface TModelDefinitions extends Array<TModelDefinition> {}

export interface IModelsConfig {
  modelsDefinitions: TModelDefinitions;
}

export interface TModelsMap<TRequirements> {
  [key: string]: Model<TRequirements>;
}
