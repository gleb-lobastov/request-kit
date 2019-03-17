import { Reducer, Action, ActionCreator } from 'redux';
import { IModelsConfig } from '@request-kit/model-normalized';
import {
  UPDATE_ENTITIES_SUCCESS,
  UPDATE_ENTITIES_FAILURE,
} from './actionTypes';

export interface IEntitiesDefinitions {
  [modelName: string]: object;
}

export interface IEntitiesDict<IEntity> {
  [entityId: string]: IEntity;
}

export interface IModelsState<IEntity> {
  [modelName: string]: IEntitiesDict<any>;
}

type ToModelsState<T extends IEntitiesDefinitions> = {
  [K in keyof T]: T[K] extends object ? IEntitiesDict<T[K]> : never
};

//  ToModelsState<D>

export interface IEntitiesActionSuccess<EntitiesState>
  extends Action<typeof UPDATE_ENTITIES_SUCCESS> {
  payload: Partial<EntitiesState>;
  meta?: object;
}

export interface IEntitiesActionCreatorSuccess {
  <EntitiesState>(entities: EntitiesState, meta: object): IEntitiesActionSuccess<EntitiesState>;
}

export type TEntitiesActionCreatorSuccess = <EntitiesState>(
  entities: EntitiesState,
  meta: object,
) => IEntitiesActionSuccess<EntitiesState>;

export interface IEntitiesActionFailure
  extends Action<typeof UPDATE_ENTITIES_FAILURE> {
  error: boolean;
  payload: Error;
  meta?: object;
}

export interface IEntitiesActionCreatorFailure {
  (error: Error, meta: object): IEntitiesActionFailure;
}

export type TEntitiesActionCreatorFailure = (
  error: Error,
  meta: object,
) => IEntitiesActionFailure;

export type IEntitiesAction<EntitiesState> =
  | IEntitiesActionSuccess<EntitiesState>
  | IEntitiesActionFailure;

export interface IEntitiesReducer<EntitiesState>
  extends Reducer<EntitiesState, IEntitiesAction<EntitiesState>> {}

export type Id = number | string;

// export interface IModelsState<Definitions> extends ModelsState<Definitions> {}

/**
 * Example of usage
 */
interface ISomeEntity {
  idA: string;
}

interface IOtherEntity {
  idB: string;
}

const x: ToModelsState<{
  some: ISomeEntity;
  other: IOtherEntity;
}> = {
  // ts will complain
  // never: {
  //  '1': { idA: '1' },
  //  '2': { idA: '2' },
  // },
  some: {
    // ok
    '1': { idA: '1' },
    '2': { idA: '2' },
  },
  other: {
    // ok
    '1': { idB: '1' },
    '2': { idB: '2' },
  },
};

// export interface IEntitiesAction extends IAction {
//   type: string;
//   payload: IModelsState;
// }

// type IModelsDefinitions = IModelsConfig['modelsDefinitions'];
// type IModelDefinition = IModelsDefinitions[number]['modelName'];
// const a: IModelDefinition = { hh: 22 };
// type ToState<K extends { [n: number]: IModelsDefinitions }> = {
//   [modelName];
// };

// interface ToState<IModelsDefinitions> {
//
// }
