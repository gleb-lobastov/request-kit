import {
  selectError,
  selectIsError,
  selectIsPending,
  selectIsReady,
  selectIsUnsent,
  selectIsValid,
  selectLastError,
  selectPlaceholder,
  selectReadyState,
  selectResult,
} from '../selectors';
import { READY_STATE, EMPTY_STATE } from '../consts';
import { TRequestState } from '../interface'; // eslint-disable-line no-unused-vars

type TTestResponse = Error | string;
interface TReadyStateCheckSelector {
  (state: TRequestState<TTestResponse>): boolean;
}
interface TTestReadyStateOptions {
  testCaseName: string;
  mapping: { [key: string]: boolean };
  selector: TReadyStateCheckSelector;
}

describe('ready state selectors', () => {
  const eachReadyState = ({
    testCaseName,
    mapping,
    selector,
  }: TTestReadyStateOptions) =>
    Object.entries(mapping).forEach(([strReadyState, expectedValue]) => {
      it(`should select is request in ${testCaseName} state (${strReadyState})`, () => {
        const readyState = Number(strReadyState);
        expect(selector({ ...EMPTY_STATE, readyState })).toBe(expectedValue);
      });
    });

  eachReadyState({
    testCaseName: 'unsent',
    mapping: {
      [READY_STATE.UNSENT]: true,
      [READY_STATE.OPENED]: false,
      [READY_STATE.HEADERS_RECEIVED]: false,
      [READY_STATE.LOADING]: false,
      [READY_STATE.DONE]: false,
    },
    selector: selectIsUnsent,
  });

  eachReadyState({
    testCaseName: 'pending',
    mapping: {
      [READY_STATE.UNSENT]: false,
      [READY_STATE.OPENED]: true,
      [READY_STATE.HEADERS_RECEIVED]: true,
      [READY_STATE.LOADING]: true,
      [READY_STATE.DONE]: false,
    },
    selector: selectIsPending,
  });

  eachReadyState({
    testCaseName: 'ready',
    mapping: {
      [READY_STATE.UNSENT]: false,
      [READY_STATE.OPENED]: false,
      [READY_STATE.HEADERS_RECEIVED]: false,
      [READY_STATE.LOADING]: false,
      [READY_STATE.DONE]: true,
    },
    selector: selectIsReady,
  });

  it('should select request ready state', () => {
    const readyState = READY_STATE.HEADERS_RECEIVED; // whatever
    expect(
      selectReadyState<TTestResponse>({ ...EMPTY_STATE, readyState }),
    ).toBe(readyState);
  });
});

describe('selectors', () => {
  const LAST_RESULT = 'whatever';
  const LAST_ERROR = new Error('=(');
  const VALID_STATE = {
    ...EMPTY_STATE,
    lastResult: LAST_RESULT,
    isValid: true,
  };
  const INVALID_STATE = {
    ...EMPTY_STATE,
    lastResult: LAST_RESULT,
    isValid: false,
  };
  const ERROR_STATE = {
    ...EMPTY_STATE,
    lastResult: LAST_RESULT,
    isError: true,
    lastError: LAST_ERROR,
  };

  it('should select valid result (1)', () => {
    expect(selectIsValid<TTestResponse>(VALID_STATE)).toBe(true);
    expect(selectResult<TTestResponse>(VALID_STATE)).toBe(LAST_RESULT);
  });

  it('should not select not valid result', () => {
    expect(selectIsValid<TTestResponse>(INVALID_STATE)).toBe(false);
    expect(selectResult<TTestResponse>(INVALID_STATE)).toBeUndefined();
  });

  it('should not select result, if current state is error', () => {
    expect(selectResult<TTestResponse>(ERROR_STATE)).toBeUndefined();
  });

  it('should select placeholder result', () => {
    expect(selectPlaceholder<TTestResponse>(VALID_STATE)).toBe(LAST_RESULT);
  });

  it('should select placeholder result even in invalid state', () => {
    expect(selectPlaceholder<TTestResponse>(INVALID_STATE)).toBe(LAST_RESULT);
  });

  it('should select placeholder result even in error state', () => {
    expect(selectPlaceholder<TTestResponse>(ERROR_STATE)).toBe(LAST_RESULT);
  });

  it('should select error if recent request failed', () => {
    expect(selectIsError<TTestResponse>(ERROR_STATE)).toBe(true);
    expect(selectError<TTestResponse>(ERROR_STATE)).toBe(LAST_ERROR);
  });

  it('should not select error if recent request was successful', () => {
    const state = { ...ERROR_STATE, ...VALID_STATE, isError: false };
    expect(selectIsError<TTestResponse>(state)).toBe(false);
    expect(selectError<TTestResponse>(state)).toBeUndefined();
  });

  it('should select last error even if recent request was successful', () => {
    const state = { ...ERROR_STATE, ...VALID_STATE, isError: false };
    expect(selectIsError<TTestResponse>(state)).toBe(false);
    expect(selectLastError(state)).toBe(LAST_ERROR);
  });
});
