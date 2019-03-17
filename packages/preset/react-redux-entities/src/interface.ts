import { IModelsConfig } from '@request-kit/intg-redux-model-normalized';

export interface IReactReduxEntitiesPresetOptions {
  distributorConfig?: object;
  modelsConfig: IModelsConfig;
  requestEngineConfig?: { plugins?: any[] };
  selectorRoot?: string;
}
