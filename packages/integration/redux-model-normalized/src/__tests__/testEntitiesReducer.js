import createReduxModelNormalizedIntegration from '../index';
import { UPDATE_ENTITIES_SUCCESS } from '../state/actionTypes';

const modelName = 'someModelName';
const otherModelName = 'someOtherModelName';

let reducer;
beforeEach(() => {
  const { reducer: requestKitReducer } = createReduxModelNormalizedIntegration({
    modelsConfig: {
      modelsDefinitions: [
        {
          modelName,
          toClientAdapter: value => value,
          endpointResolver: null,
        },
        {
          modelName: otherModelName,
          toClientAdapter: value => value,
          endpointResolver: null,
        },
      ],
    },
  });
  reducer = requestKitReducer;
});

describe('reducer', () => {
  it('should reduce model to state', () => {
    const modelWithId1 = { modelId: 1, clientField: 'fieldValue1' };
    const state = reducer(undefined, {
      type: UPDATE_ENTITIES_SUCCESS,
      payload: {
        [modelName]: { [modelWithId1.modelId]: modelWithId1 },
      },
    });
    expect(state[modelName][modelWithId1.modelId]).toBe(modelWithId1);
  });

  it('should reduce list of models to state', () => {
    const modelWithId1 = { modelId: 1, clientField: 'fieldValue1' };
    const modelWithId3 = { modelId: 1, clientField: 'fieldValue1' };
    const modelWithId9 = { modelId: 1, clientField: 'fieldValue1' };
    const state = reducer(undefined, {
      type: UPDATE_ENTITIES_SUCCESS,
      payload: {
        [modelName]: {
          [modelWithId1.modelId]: modelWithId1,
          [modelWithId3.modelId]: modelWithId3,
          [modelWithId9.modelId]: modelWithId9,
        },
      },
    });
    expect(state[modelName]).toEqual({
      [modelWithId1.modelId]: modelWithId1,
      [modelWithId3.modelId]: modelWithId3,
      [modelWithId9.modelId]: modelWithId9,
    });
  });

  it('should reduce different entities to state at same time', () => {
    const modelWithId1 = { modelId: 1, clientField: 'fieldValue1' };
    const otherModelWithId1 = {
      otherModelId: 1,
      clientField: 'otherFieldValue1',
    };
    const state = reducer(undefined, {
      type: UPDATE_ENTITIES_SUCCESS,
      payload: {
        [modelName]: {
          [modelWithId1.modelId]: modelWithId1,
        },
        [otherModelName]: {
          [otherModelWithId1.otherModelId]: otherModelWithId1,
        },
      },
    });
    expect(state).toEqual({
      [modelName]: {
        [modelWithId1.modelId]: modelWithId1,
      },
      [otherModelName]: {
        [otherModelWithId1.otherModelId]: otherModelWithId1,
      },
    });
  });
});
