import { READY_STATE } from '../consts';
import { PROCESS_REQUEST } from '../actionTypes';
import createRequestReducer from '../reducer';
import { TRequestState, TAction } from '../interface'; // eslint-disable no-unused-vars

let requestReducer: <TResponse>(
  state: TRequestState<TResponse>,
  action: TAction,
) => TRequestState<TResponse>;
beforeEach(() => {
  requestReducer = createRequestReducer();
});

describe('basic request reducers', () => {
  describe('pending action', () => {
    it('should set ready state to open and discard recent values, but not lastSuccessful', () => {
      const lastError = new Error('ha-ha');
      const lastResult = 'Fallback to me';
      const successAction = {
        type: PROCESS_REQUEST,
        meta: { readyState: READY_STATE.OPENED },
      };
      const prevState = {
        isError: true,
        isValid: true,
        lastError,
        lastResult,
        readyState: READY_STATE.DONE,
      };

      expect(requestReducer(prevState, successAction)).toEqual(
        expect.objectContaining({
          isError: true,
          isValid: true,
          lastError,
          lastResult,
          readyState: READY_STATE.OPENED,
        }),
      );
    });
  });

  describe('succeed action', () => {
    it('should set done state and fulfill both recent and lastSuccessful sections', () => {
      const result = 'amazing awesome thing, that you expected to see';
      const lastResult = 'old but not useless';
      const successAction = {
        type: PROCESS_REQUEST,
        payload: result,
        meta: { readyState: READY_STATE.DONE },
      };
      const prevState = {
        isError: false,
        isValid: false,
        lastResult,
        readyState: READY_STATE.OPENED,
      };

      expect(requestReducer(prevState, successAction)).toEqual({
        isError: false,
        isValid: true,
        lastResult: result,
        readyState: READY_STATE.DONE,
      });
    });
  });

  describe('failure action', () => {
    it('should set done state and fulfill error both in ongoing and fulfilled sections', () => {
      const lastError = new Error('All gone!');
      const lastResult = 'cute kittens';
      const prevState = {
        isError: false,
        isValid: true,
        lastResult,
        readyState: READY_STATE.OPENED,
      };

      const failureAction = {
        type: PROCESS_REQUEST,
        payload: lastError,
        error: true,
        meta: { readyState: READY_STATE.DONE },
      };

      expect(requestReducer(prevState, failureAction)).toEqual({
        isError: true,
        isValid: true,
        lastError,
        lastResult,
        readyState: READY_STATE.DONE,
      });
    });
  });
});
