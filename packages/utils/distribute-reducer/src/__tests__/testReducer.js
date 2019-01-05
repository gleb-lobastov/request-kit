import distributeReducerByDomain from '../index.ts';

const { consts } = distributeReducerByDomain;
const TEST_ACTION_TYPE = 'TEST_ACTION_TYPE';

describe('distribution', () => {
  it('should ignore action if no options for distributeReducerByDomain is present', () => {
    const state = {};
    const action = { type: TEST_ACTION_TYPE };
    const reducer = distributeReducerByDomain({
      reducer: () => ({}),
    }).reduce;
    expect(reducer(state, action)).toBe(state);
  });

  it('should consider requestDomain as part of path', () => {
    const prevState = undefined;
    const domain = 'requestDomain';
    const action = {
      type: TEST_ACTION_TYPE,
      meta: { domain },
    };
    const reducer = distributeReducerByDomain({
      reducer: () => ({ isReduced: true }),
    }).reduce;
    expect(reducer(prevState, action)).toEqual({
      domains: {
        [domain]: {
          domainState: { isReduced: true },
        },
      },
    });
  });

  it('should consider parts of domain separated by comma as subdomains', () => {
    const prevState = undefined;
    const requestDomain = 'requestDomain';
    const requestSubdomain = 'requestSubdomain';
    const action = {
      type: TEST_ACTION_TYPE,
      meta: {
        domain: [requestDomain, requestSubdomain].join(
          consts.PATH_PARTITIONS_SEPARATOR,
        ),
      },
    };
    const reducer = distributeReducerByDomain({
      reducer: () => ({ isReduced: true }),
    }).reduce;
    expect(reducer(prevState, action)).toEqual({
      domains: {
        [requestDomain]: {
          domains: {
            [requestSubdomain]: {
              domainState: { isReduced: true },
            },
          },
        },
      },
    });
  });

  it('should perform over previous state', () => {
    const domain = 'requestDomain';
    const prevDomainState = {};
    const prevState = {
      domains: { [domain]: { domainState: prevDomainState } },
    };
    const action = {
      type: TEST_ACTION_TYPE,
      meta: { domain },
    };
    const reducer = distributeReducerByDomain({
      reducer: state => ({ isReduced: true, prevState: state }),
    }).reduce;
    expect(
      reducer(prevState, action).domains[domain].domainState.prevState,
    ).toBe(prevDomainState);
  });

  it('should return same root state object if wrapped reducer return same state', () => {
    const domain = 'requestDomain';
    const prevState = { domains: { [domain]: { state: {} } } };
    const action = {
      type: TEST_ACTION_TYPE,
      meta: { domain },
    };
    const reducer = distributeReducerByDomain({
      reducer: state => state,
    }).reduce;
    expect(reducer(prevState, action)).toBe(prevState);
  });
});
