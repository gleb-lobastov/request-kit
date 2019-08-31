import configureStore from 'redux-mock-store';
import strategyEnhancer from '../strategyEnhancer';
import { PROCESS_REQUEST } from '../actionTypes';
import { READY_STATE } from '../consts';
import {
  /* eslint-disable no-unused-vars */
  TRequestStrategy,
  TRequestPendingAction,
  TRequestFailureAction,
  TRequestSuccessAction,
  /* eslint-enable no-unused-vars */
} from '../interface';

type TTestResponse = Error | string;
interface TTestRequirements {
  readonly response: TTestResponse;
}

const mockStore = configureStore();

let strategy: jest.Mock<Promise<TTestResponse>, [TTestRequirements, ...any[]]>;
let enhancedStrategy: TRequestStrategy<TTestRequirements, TTestResponse>;
beforeEach(() => {
  strategy = jest.fn<Promise<TTestResponse>, [TTestRequirements, ...any[]]>(
    async ({ response }) => response,
  );
  enhancedStrategy = strategyEnhancer(strategy);
});

const expectPendingAction = (
  requirements: TTestRequirements,
): TRequestPendingAction<TTestRequirements> => ({
  type: PROCESS_REQUEST,
  meta: {
    ...requirements,
    readyState: READY_STATE.OPENED,
  },
});

const expectSuccessAction = (
  requirements: TTestRequirements,
  response: TTestResponse,
): TRequestSuccessAction<TTestRequirements, TTestResponse> => ({
  type: PROCESS_REQUEST,
  payload: response,
  meta: {
    ...requirements,
    readyState: READY_STATE.DONE,
  },
});

const expectFailureAction = (
  requirements: TTestRequirements,
  error: Error,
): TRequestFailureAction<TTestRequirements> => ({
  type: PROCESS_REQUEST,
  payload: error,
  error: true,
  meta: {
    ...requirements,
    readyState: READY_STATE.DONE,
  },
});

describe('redux actions produced by request middleware', () => {
  it('should dispatch "pending" and "success" actions for successful request', async () => {
    expect.assertions(3);

    const response = 'hello word';
    const requirements = { response };
    const store = mockStore({});

    await enhancedStrategy(requirements, store.dispatch, store.getState);

    expect(strategy.mock.calls).toHaveLength(1);
    expect(strategy.mock.calls[0]).toEqual([
      requirements,
      store.dispatch,
      store.getState,
    ]);
    expect(store.getActions()).toEqual([
      expectPendingAction(requirements),
      expectSuccessAction(requirements, response),
    ]);
  });

  it('should dispatch "pending" and "failure" actions for failed request', async () => {
    expect.assertions(3);

    const error = new Error('bang');
    const requirements = { response: error };
    const store = mockStore({});

    await enhancedStrategy(requirements, store.dispatch, store.getState);

    expect(strategy.mock.calls).toHaveLength(1);
    expect(strategy.mock.calls[0]).toEqual([
      requirements,
      store.dispatch,
      store.getState,
    ]);
    expect(store.getActions()).toEqual([
      expectPendingAction(requirements),
      expectFailureAction(requirements, error),
    ]);
  });
});
