import {
  selectError,
  selectIsPending,
  selectIsReady,
  selectPlaceholder,
  selectReadyState,
  selectResult,
} from '../selectors';
import { READY_STATE, EMPTY_STATE } from '../consts';

type TTestResponse = Error | string;

describe('selectors', () => {
  it('should select request ready state', () => {
    const readyState = READY_STATE.HEADERS_RECEIVED; // whatever
    expect(
      selectReadyState<TTestResponse>({ ...EMPTY_STATE, readyState }),
    ).toBe(readyState);
  });

  const pendingStateMapping = {
    [READY_STATE.UNSENT]: false,
    [READY_STATE.OPENED]: true,
    [READY_STATE.HEADERS_RECEIVED]: true,
    [READY_STATE.LOADING]: true,
    [READY_STATE.DONE]: false,
  };
  Object.entries(pendingStateMapping).forEach(
    ([strReadyState, isPendingShouldBe]) => {
      it(`should select is request in pending state (${strReadyState})`, () => {
        const readyState = Number(strReadyState);
        expect(
          selectIsPending<TTestResponse>({ ...EMPTY_STATE, readyState }),
        ).toBe(isPendingShouldBe);
      });
    },
  );

  const readyStateMapping = {
    [READY_STATE.UNSENT]: false,
    [READY_STATE.OPENED]: false,
    [READY_STATE.HEADERS_RECEIVED]: false,
    [READY_STATE.LOADING]: false,
    [READY_STATE.DONE]: true,
  };
  Object.entries(readyStateMapping).forEach(
    ([strReadyState, isReadyShouldBe]) => {
      it(`should select is request in completed state (${strReadyState})`, () => {
        const readyState = Number(strReadyState);
        expect(
          selectIsReady<TTestResponse>({
            ...EMPTY_STATE,
            readyState: readyState as READY_STATE,
          }),
        ).toBe(isReadyShouldBe);
      });
    },
  );

  it('should select available result (1)', () => {
    const lastSuccessfulResult = 'whatever';
    expect(
      selectPlaceholder<TTestResponse>({
        lastResult: lastSuccessfulResult,
        isValid: false,
        isError: false,
        readyState: READY_STATE.DONE,
      }),
    ).toBe(lastSuccessfulResult);
  });

  it('should select available result (2)', () => {
    const lastSuccessfulResult = 'whatever';
    expect(
      selectPlaceholder<TTestResponse>({
        lastError: new Error('Sorry, man'),
        lastResult: lastSuccessfulResult,
        isValid: false,
        isError: true,
        readyState: READY_STATE.DONE,
      }),
    ).toBe(lastSuccessfulResult);
  });

  it('should select available result (3)', () => {
    const recentResult = 'whatever';
    expect(
      selectPlaceholder<TTestResponse>({
        lastResult: recentResult,
        isValid: true,
        isError: false,
        readyState: READY_STATE.DONE,
      }),
    ).toBe(recentResult);
  });

  it('should select only relevant result (1)', () => {
    expect(
      selectResult<TTestResponse>({
        lastResult: 'lastSuccessfulResult',
        isValid: false,
        isError: false,
        readyState: READY_STATE.DONE,
      }),
    ).toBeUndefined();
  });

  it('should select only relevant result (2)', () => {
    expect(
      selectResult<TTestResponse>({
        lastError: new Error('Shit happens'),
        lastResult: 'lastSuccessfulResult',
        isValid: false,
        isError: false,
        readyState: READY_STATE.DONE,
      }),
    ).toBeUndefined();
  });

  it('should select only relevant result (3)', () => {
    const recentResult = 'whatever';
    expect(
      selectResult<TTestResponse>({
        lastResult: recentResult,
        isValid: true,
        isError: false,
        readyState: READY_STATE.DONE,
      }),
    ).toBe(recentResult);
  });

  it('should select error if recent request failed (1)', () => {
    expect(
      selectError<TTestResponse>({
        lastResult: 'lastSuccessfulResult',
        isValid: false,
        isError: false,
        readyState: READY_STATE.DONE,
      }),
    ).toBeUndefined();
  });

  it('should select error if recent request failed (2)', () => {
    const lastError = new Error('Slow down');
    expect(
      selectError<TTestResponse>({
        lastError,
        lastResult: 'lastSuccessfulResult',
        isValid: false,
        isError: true,
        readyState: READY_STATE.DONE,
      }),
    ).toBe(lastError);
  });

  it('should select error if recent request failed (3)', () => {
    expect(
      selectError<TTestResponse>({
        lastResult: 'recentResult',
        isValid: true,
        isError: false,
        readyState: READY_STATE.DONE,
      }),
    ).toBeUndefined();
  });
});
