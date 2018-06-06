import configureStore from 'redux-mock-store';
import createRequestMiddleware from '../middleware';
import { createRequestAction } from '../actionCreators';
import { PROCESS_REQUEST } from '../actionTypes';
import { READY_STATE } from '../consts';

const reduxMiddleware = createRequestMiddleware({
  engine: {
    preset() {
      return this;
    },
    request: ({ response }) => (
      response instanceof Error ? Promise.reject(response) : Promise.resolve(response)
    ),
  },
});
const mockStore = configureStore([reduxMiddleware]);

describe('redux actions produced by request middleware', () => {
  it('should dispatch "pending" and "success" actions for successful request', async () => {
    expect.assertions(1);

    const response = 'hello word';
    const params = { response };
    const store = mockStore({});

    await store.dispatch(createRequestAction(params));

    const actions = store.getActions();
    const pendingAction = {
      type: PROCESS_REQUEST,
      meta: expect.objectContaining({ params, readyState: READY_STATE.OPENED }),
    };
    const successAction = {
      type: PROCESS_REQUEST,
      payload: response,
      meta: expect.objectContaining({ params, readyState: READY_STATE.DONE }),
    };

    expect(actions).toEqual([pendingAction, successAction]);
  });

  it('should dispatch "pending" and "failure" actions for failed request', async () => {
    expect.assertions(1);

    const error = new Error('bang');
    const params = { response: error };
    const store = mockStore({});

    await store.dispatch(createRequestAction(params));

    const actions = store.getActions();
    const pendingAction = {
      type: PROCESS_REQUEST,
      meta: expect.objectContaining({ params, readyState: READY_STATE.OPENED }),
    };
    const failureAction = {
      type: PROCESS_REQUEST,
      payload: error,
      error: true,
      meta: expect.objectContaining({ params, readyState: READY_STATE.DONE }),
    };

    expect(actions).toEqual([pendingAction, failureAction]);
  });
});
