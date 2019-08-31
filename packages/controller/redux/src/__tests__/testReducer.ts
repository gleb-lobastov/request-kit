import createRequestReducer from '../reducer';
import {
  createFailureAction,
  createInvalidateRequestAction,
  createPendingAction,
  createSuccessAction,
} from '../actionCreators';
import { EMPTY_STATE } from '../consts';
import { TRequestState, TAction } from '../interface'; // eslint-disable-line no-unused-vars

type TTestResponse = void;
let requestReducer: (
  state: TRequestState<TTestResponse>,
  action: TAction,
) => TRequestState<TTestResponse>;
beforeEach(() => {
  requestReducer = createRequestReducer();
});

const requirements = {};
const pendingAction = createPendingAction(requirements);
const failureAction = createFailureAction(requirements, new Error('=('));
const successAction = createSuccessAction(requirements, 'result');
const invalidateAction = createInvalidateRequestAction(requirements);
const unrelatedAction = { type: 'unrelated' };

const match = (...actions: Array<TAction>) => {
  let state = EMPTY_STATE;
  return actions.forEach(action => {
    state = requestReducer(state, action);
    expect(state).toMatchSnapshot();
  });
};
describe('request reducer', () => {
  it('should match empty state', () => {
    // @ts-ignore check for state initial request
    expect(requestReducer(undefined, unrelatedAction)).toEqual(EMPTY_STATE);
  });

  it('should match pendingAction, successAction, invalidateAction', () => {
    match(pendingAction, successAction, invalidateAction);
  });

  it('should match pendingAction, failureAction, invalidateAction', () => {
    match(pendingAction, failureAction, invalidateAction);
  });

  it('should match invalidateAction', () => {
    match(invalidateAction);
  });

  it('should match pendingAction, failureAction, pendingAction, failureAction', () => {
    match(pendingAction, failureAction, pendingAction, failureAction);
  });

  it('should match pendingAction, failureAction, pendingAction, successAction', () => {
    match(pendingAction, failureAction, pendingAction, successAction);
  });

  it('should match pendingAction, successAction, pendingAction, failureAction', () => {
    match(pendingAction, successAction, pendingAction, failureAction);
  });

  it('should match pendingAction, successAction, pendingAction, successAction', () => {
    match(pendingAction, successAction, pendingAction, successAction);
  });

  it('should match pendingAction, successAction, invalidateAction, pendingAction, successAction', () => {
    match(
      pendingAction,
      successAction,
      invalidateAction,
      pendingAction,
      successAction,
    );
  });
});
