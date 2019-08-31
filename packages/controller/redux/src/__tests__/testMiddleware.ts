import configureStore, { MockStoreCreator } from 'redux-mock-store'; // eslint-disable-line no-unused-vars
import createRequestMiddleware from '../middleware';
import { createRequestAction } from '../actionCreators';
import { EMPTY_STATE } from '../consts';
import { TRequestState } from '../interface'; // eslint-disable-line no-unused-vars

type TTestResponse = void;
interface TTestRequirements {}

let requestStrategy: jest.Mock<
  Promise<TTestResponse>,
  [TTestRequirements, ...any[]]
>;
let mockStore: MockStoreCreator<TRequestState<TTestResponse>>;
beforeEach(() => {
  requestStrategy = jest.fn<
    Promise<TTestResponse>,
    [TTestRequirements, ...any[]]
  >(async () => {});
  const requestKitMiddleware = createRequestMiddleware({ requestStrategy });
  mockStore = configureStore([requestKitMiddleware]);
});

describe('request-kit redux middleware', () => {
  it('should invoke requestStrategy for proper action', async () => {
    expect.assertions(2);
    const store = mockStore(EMPTY_STATE);
    await store.dispatch(createRequestAction({}));
    expect(requestStrategy.mock.calls).toHaveLength(1);
    expect(store.getActions()).toEqual([]);
  });

  it('should not invoke requestStrategy for any other action', async () => {
    expect.assertions(2);
    const store = mockStore(EMPTY_STATE);
    const unrelatedAction = { type: 'unrelated' };
    await store.dispatch(unrelatedAction);
    expect(requestStrategy.mock.calls).toHaveLength(0);
    expect(store.getActions()).toEqual([unrelatedAction]);
  });
});
