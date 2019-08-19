import createWindowedReducer from '../distributeReducer/createWindowedReducer';
import { PATH_PARTITIONS_SEPARATOR } from '../utils';

const TEST_ACTION_TYPE = 'TEST_ACTION_TYPE';
const NOOP_ACTION_TYPE = 'NOOP_ACTION_TYPE';

const testReducer = (domainCompositeState = {}, { type }) => {
  const { domainState } = domainCompositeState;
  if (type === TEST_ACTION_TYPE) {
    return {
      ...domainCompositeState,
      domainState: { prevState: domainState, isReduced: true },
    };
  }
  return domainCompositeState;
};

let windowedReducer;
beforeEach(() => {
  windowedReducer = createWindowedReducer(jest.fn(testReducer));
});

describe('windowedReducer', () => {
  it('should reduce root domainState if "domain" option is not present', () => {
    const state = {};
    const action = { type: TEST_ACTION_TYPE };
    expect(windowedReducer(state, action)).toEqual({
      domainState: expect.objectContaining({ isReduced: true }),
      domains: {},
    });
  });

  it('should reduce particular domainState if "domain" option is present', () => {
    const prevState = undefined;
    const domain = 'requestDomain';
    const action = {
      type: TEST_ACTION_TYPE,
      meta: { domain },
    };
    expect(windowedReducer(prevState, action)).toEqual({
      domains: {
        [domain]: {
          domainState: expect.objectContaining({ isReduced: true }),
          domains: {},
        },
      },
    });
  });

  it('should reduce particular domainState if "domain" option is present and contains subdomain', () => {
    const prevState = undefined;
    const requestDomain = 'requestDomain';
    const requestSubdomain = 'requestSubdomain';
    const action = {
      type: TEST_ACTION_TYPE,
      meta: {
        domain: [requestDomain, requestSubdomain].join(
          PATH_PARTITIONS_SEPARATOR,
        ),
      },
    };
    expect(windowedReducer(prevState, action)).toEqual({
      domains: {
        [requestDomain]: {
          domains: {
            [requestSubdomain]: {
              domainState: { isReduced: true },
              domains: {},
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
    expect(
      windowedReducer(prevState, action).domains[domain].domainState.prevState,
    ).toBe(prevDomainState);
  });

  it('should return same root state object if wrapped reducer return same state', () => {
    const domain = 'requestDomain';
    const prevState = { domains: { [domain]: { state: {} } } };
    const action = {
      type: NOOP_ACTION_TYPE,
      meta: { domain },
    };
    expect(windowedReducer(prevState, action)).toBe(prevState);
  });
});
