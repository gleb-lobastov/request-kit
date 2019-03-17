import { IModelDefinition, IModel } from '../Model';

export interface IModelDefinitions extends Array<IModelDefinition> {}

export interface IModelsConfig {
  modelsDefinitions: IModelDefinitions;
}

export interface IModelsMap {
  [key: string]: IModel;
}
