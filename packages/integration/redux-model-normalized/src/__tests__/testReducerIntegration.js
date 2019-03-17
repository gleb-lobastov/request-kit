import createRequestKit from '../index';
import { UPDATE_ENTITIES_SUCCESS } from '../state/actionTypes';

const modelName = 'someModelName';
const nestingModelName = 'someNestingModelName';
const nestedModelName = 'someNestedModelName';

let reducer;
beforeEach(() => {
  const { reducer: requestKitReducer } = createRequestKit({
    modelsConfig: {
      modelsDefinitions: [
        {
          modelName,
          toClientAdapter: value => value,
          endpointResolver: null,
        },
        {
          modelName: nestedModelName,
          toClientAdapter: value => value,
          endpointResolver: null,
        },
        {
          modelName: nestingModelName,
          toClientAdapter: value => value,
          endpointResolver: null,
          schema: {
            definition: {
              nestedModelItem: reference =>
                reference({ modelName: nestedModelName }),
            },
            options: {},
          },
        },
      ],
    },
  });
  reducer = requestKitReducer;
});

describe.skip('reducer', () => {
  it('should reduce model to state', () => {
    const modelWithId1 = { modelId: 1, clientField: 'fieldValue1' };
    const state = reducer(undefined, {
      type: UPDATE_ENTITIES_SUCCESS,
      payload: {
        result: modelWithId1.modelId, // unrelated
        entities: {
          [modelName]: { [modelWithId1.modelId]: modelWithId1 },
        },
      },
      meta: { modelName },
    });
    console.log(state);
    expect(state.entities[modelName][modelWithId1.modelId]).toBe(modelWithId1);
  });

  it('should reduce list of models to state', () => {
    const modelWithId1 = { modelId: 1, clientField: 'fieldValue1' };
    const modelWithId3 = { modelId: 1, clientField: 'fieldValue1' };
    const modelWithId9 = { modelId: 1, clientField: 'fieldValue1' };
    const state = reducer(undefined, {
      type: UPDATE_ENTITIES_SUCCESS,
      payload: {
        result: [
          modelWithId1.modelId,
          modelWithId3.modelId,
          modelWithId9.modelId,
        ], // unrelated
        entities: {
          [modelName]: {
            [modelWithId1.modelId]: modelWithId1,
            [modelWithId3.modelId]: modelWithId3,
            [modelWithId9.modelId]: modelWithId9,
          },
        },
      },
      meta: { modelName },
    });
    expect(state.entities[modelName]).toEqual({
      modelWithId1,
      modelWithId3,
      modelWithId9,
    });
  });

  it('should reduce nestedModel to state', () => {
    const nestedModelWithId3 = { nestedModelId: 3, clientField: 'fieldValue1' };
    const nestingModelWithId9 = { nestingModelId: 9, nestedModelItem: 3 };
    const state = reducer(undefined, {
      type: UPDATE_ENTITIES_SUCCESS,
      payload: {
        result: nestingModelWithId9.modelId, // additional test
        entities: {
          // additional test
          [nestingModelName]: {
            [nestingModelWithId9.nestingModelId]: nestingModelWithId9,
          },
          // main test
          [nestedModelName]: {
            [nestedModelWithId3.nestedModelId]: nestedModelWithId3,
          },
        },
      },
      meta: { modelName: nestingModelName },
    });
    expect(state.entities[nestedModelName][nestedModelWithId3.modelId]).toBe(
      nestedModelWithId3,
    );
  });
});
