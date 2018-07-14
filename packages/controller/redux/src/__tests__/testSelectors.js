import * as selectors from '../selectors';
import * as consts from '../consts';

describe('selectors', () => {
  it('should select request ready state', () => {
    const readyState = 'whatever';
    expect(selectors.selectReadyState({ readyState })).toBe(readyState);
  });

  const pendingStateMapping = {
    [consts.READY_STATE.UNSENT]: false,
    [consts.READY_STATE.OPENED]: true,
    [consts.READY_STATE.HEADERS_RECEIVED]: true,
    [consts.READY_STATE.LOADING]: true,
    [consts.READY_STATE.DONE]: false,
  };
  Object.entries(pendingStateMapping).forEach(
    ([strReadyState, isPendingShouldBe]) => {
      it(`should select is request in pending state (${strReadyState})`, () => {
        const readyState = Number(strReadyState);
        expect(selectors.selectIsPending({ readyState })).toBe(
          isPendingShouldBe,
        );
      });
    },
  );

  const readyStateMapping = {
    [consts.READY_STATE.UNSENT]: false,
    [consts.READY_STATE.OPENED]: false,
    [consts.READY_STATE.HEADERS_RECEIVED]: false,
    [consts.READY_STATE.LOADING]: false,
    [consts.READY_STATE.DONE]: true,
  };
  Object.entries(readyStateMapping).forEach(
    ([strReadyState, isReadyShouldBe]) => {
      it(`should select is request in completed state (${strReadyState})`, () => {
        const readyState = Number(strReadyState);
        expect(selectors.selectIsReady({ readyState })).toBe(isReadyShouldBe);
      });
    },
  );

  it('should select available result (1)', () => {
    const lastSuccessfulResult = 'whatever';
    expect(
      selectors.selectAvailableResult({
        recent: {},
        lastSuccessful: {
          result: lastSuccessfulResult,
        },
      }),
    ).toBe(lastSuccessfulResult);
  });

  it('should select available result (2)', () => {
    const lastSuccessfulResult = 'whatever';
    expect(
      selectors.selectAvailableResult({
        recent: {
          error: new Error('Sorry, man'),
        },
        lastSuccessful: {
          result: lastSuccessfulResult,
        },
      }),
    ).toBe(lastSuccessfulResult);
  });

  it('should select available result (3)', () => {
    const recentResult = 'whatever';
    expect(
      selectors.selectAvailableResult({
        recent: {
          result: recentResult,
        },
        lastSuccessful: {
          result: 'lastSuccessfulResult',
        },
      }),
    ).toBe(recentResult);
  });

  it('should select only relevant result (1)', () => {
    expect(
      selectors.selectRelevantResult({
        recent: {},
        lastSuccessful: {
          result: 'lastSuccessfulResult',
        },
      }),
    ).toBeUndefined();
  });

  it('should select only relevant result (2)', () => {
    expect(
      selectors.selectRelevantResult({
        recent: {
          error: new Error('Shit happens'),
        },
        lastSuccessful: {
          result: 'lastSuccessfulResult',
        },
      }),
    ).toBeUndefined();
  });

  it('should select only relevant result (3)', () => {
    const recentResult = 'whatever';
    expect(
      selectors.selectRelevantResult({
        recent: {
          result: recentResult,
        },
        lastSuccessful: {
          result: 'lastSuccessfulResult',
        },
      }),
    ).toBe(recentResult);
  });

  it('should select error if recent request failed (1)', () => {
    expect(
      selectors.selectError({
        recent: {},
        lastSuccessful: {
          result: 'lastSuccessfulResult',
        },
      }),
    ).toBeUndefined();
  });

  it('should select error if recent request failed (2)', () => {
    const error = new Error('Slow down');
    expect(
      selectors.selectError({
        recent: {
          error,
        },
        lastSuccessful: {
          result: 'lastSuccessfulResult',
        },
      }),
    ).toBe(error);
  });

  it('should select error if recent request failed (3)', () => {
    expect(
      selectors.selectError({
        recent: {
          result: 'recentResult',
        },
        lastSuccessful: {
          result: 'lastSuccessfulResult',
        },
      }),
    ).toBeUndefined();
  });
});
