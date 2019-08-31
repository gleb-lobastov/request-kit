import configureStore from 'redux-mock-store';
import createRequestMiddleware from '../middleware';
import strategyEnhancer from '../strategyEnhancer';
import { createRequestAction } from '../actionCreators';
import { PROCESS_REQUEST } from '../actionTypes';
import { READY_STATE } from '../consts';
import { TRequestStrategy } from '../interface'; // eslint-disable-line no-unused-vars

type TTestResponse = Error | string;

interface TTestRequirements {
  readonly response: TTestResponse;
}

const requestStrategy: TRequestStrategy<TTestRequirements, TTestResponse> = ({
  response,
}) =>
  response instanceof Error
    ? Promise.reject(response)
    : Promise.resolve(response);

const reduxMiddleware = createRequestMiddleware({
  requestStrategy: strategyEnhancer(requestStrategy),
});
const mockStore = configureStore([reduxMiddleware]);

describe('redux actions produced by request middleware', () => {
  it('should dispatch "pending" and "success" actions for successful request', async () => {
    expect.assertions(1);

    const response = 'hello word';
    const requirements = { response };
    const store = mockStore({});

    await store.dispatch(createRequestAction(requirements));

    const actions = store.getActions();
    const pendingAction = {
      type: PROCESS_REQUEST,
      meta: {
        ...requirements,
        readyState: READY_STATE.OPENED,
      },
    };
    const successAction = {
      type: PROCESS_REQUEST,
      payload: response,
      meta: {
        ...requirements,
        readyState: READY_STATE.DONE,
      },
    };

    expect(actions).toEqual([pendingAction, successAction]);
  });

  it('should dispatch "pending" and "failure" actions for failed request', async () => {
    expect.assertions(1);

    const error = new Error('bang');
    const requirements = { response: error };
    const store = mockStore({});

    await store.dispatch(createRequestAction(requirements));

    const actions = store.getActions();
    const pendingAction = {
      type: PROCESS_REQUEST,
      meta: {
        ...requirements,
        readyState: READY_STATE.OPENED,
      },
    };
    const failureAction = {
      type: PROCESS_REQUEST,
      payload: error,
      error: true,
      meta: {
        ...requirements,
        readyState: READY_STATE.DONE,
      },
    };

    expect(actions).toEqual([pendingAction, failureAction]);
  });
});
