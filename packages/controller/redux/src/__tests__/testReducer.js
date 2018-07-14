import { READY_STATE } from '../consts';
import { PROCESS_REQUEST } from '../actionTypes';
import createRequestReducer from '../reducer';

let requestReducer;
beforeEach(() => {
  requestReducer = createRequestReducer();
});

describe('basic request reducers', () => {
  describe('pending action', () => {
    it('should set ready state to open and discard recent values, but not lastSuccessful', () => {
      const lastSuccessfulResult = 'Fallback to me';
      const successAction = {
        type: PROCESS_REQUEST,
        meta: { readyState: READY_STATE.OPENED },
      };
      const prevState = {
        recent: {
          error: new Error('ha-ha'),
        },
        lastSuccessful: {
          result: lastSuccessfulResult,
        },
        readyState: READY_STATE.DONE,
      };

      expect(requestReducer(prevState, successAction)).toEqual(
        expect.objectContaining({
          recent: {},
          lastSuccessful: {
            result: lastSuccessfulResult,
          },
          readyState: READY_STATE.OPENED,
        }),
      );
    });
  });

  describe('succeed action', () => {
    it('should set done state and fulfill both recent and lastSuccessful sections', () => {
      const result = 'amazing awesome thing, that you expected to see';
      const lastSuccessfulResult = 'old but not useless';
      const successAction = {
        type: PROCESS_REQUEST,
        payload: result,
        meta: { readyState: READY_STATE.DONE },
      };
      const prevState = {
        recent: {},
        lastSuccessful: {
          result: lastSuccessfulResult,
        },
        readyState: READY_STATE.OPENED,
      };

      expect(requestReducer(prevState, successAction)).toEqual(
        expect.objectContaining({
          recent: {
            result,
          },
          lastSuccessful: {
            result,
          },
          readyState: READY_STATE.DONE,
        }),
      );
    });
  });

  describe('failure action', () => {
    it('should set done state and fulfill error both in ongoing and fulfilled sections', () => {
      const error = new Error('All gone!');
      const lastSuccessfulResult = 'cute kittens';
      const prevState = {
        recent: {},
        lastSuccessful: {
          result: lastSuccessfulResult,
        },
        readyState: READY_STATE.OPENED,
      };

      const failureAction = {
        type: PROCESS_REQUEST,
        payload: error,
        error: true,
        meta: { readyState: READY_STATE.DONE },
      };

      expect(requestReducer(prevState, failureAction)).toEqual(
        expect.objectContaining({
          recent: {
            error,
          },
          lastSuccessful: {
            result: lastSuccessfulResult,
          },
          readyState: READY_STATE.DONE,
        }),
      );
    });
  });
});
