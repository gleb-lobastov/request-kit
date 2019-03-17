import { IModelsState } from '../state/interface';

export interface INormalizedResponse<EntitiesState> {
  result: any;
  entities?: IModelsState<EntitiesState>;
}
