import { IModelsConfig } from '@request-kit/model-normalized';

export interface IReduxModelNormalizedConfig {
  entitiesSelectorRoot: string;
  modelsConfig: IModelsConfig;
}

export interface ISelector {
  (state: any, ...args: any[]): any;
}

export interface IModelSelector {
  (state: any, modelName: string, ...args: any[]): any;
}

export interface IBoundSelector {
  (state: any, ...args: any[]): any;
}

export interface IAdoptedSelector extends IModelSelector {
  (state: any, ...selectorArgs: any[]): any;
  bindModel: (modelName: string) => IBoundSelector;
}
