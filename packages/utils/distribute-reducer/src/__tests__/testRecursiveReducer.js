import createRecursiveReducer from '../distributeReducer/createRecursiveReducer';

const TEST_ACTION_TYPE = 'TEST_ACTION_TYPE';
const NOOP_ACTION_TYPE = 'NOOP_ACTION_TYPE';

let targetReducer;
let recursiveReducer;
let state;
beforeEach(() => {
  targetReducer = jest.fn((domainState = {}, { type }) => {
    if (type === TEST_ACTION_TYPE) {
      return { ...domainState, isReduced: true };
    }
    return domainState;
  });
  recursiveReducer = createRecursiveReducer(targetReducer);
  state = {
    domainState: { isReduced: false },
    domains: {
      A1: {
        domainState: { name: 'A1', isReduced: false },
      },
      B1: {
        domainState: { name: 'B1', isReduced: false },
        domains: {
          A2: {
            domainState: { name: 'A2', isReduced: false },
          },
          B2: {
            domainState: { name: 'B2', isReduced: false },
            domains: {
              A3: {
                domainState: { name: 'A3', isReduced: false },
              },
            },
          },
        },
      },
    },
  };
});

describe('recursiveReducer', () => {
  describe('maxNestingDepth option', () => {
    it('not go recursion by default (max depth = 0)', () => {
      const action = { type: TEST_ACTION_TYPE };
      const nextState = recursiveReducer(state, action);
      expect(nextState.domainState.isReduced).toBe(true);
      expect(nextState.domains).toBe(state.domains);
    });

    it('use recursion when max depth is specified', () => {
      const action = {
        type: TEST_ACTION_TYPE,
        meta: { distributeReducerOptions: { maxNestingDepth: 1 } },
      };
      const nextState = recursiveReducer(state, action);
      expect(nextState.domainState.isReduced).toBe(true);
      expect(nextState.domains.A1.domainState.isReduced).toBe(true);
      expect(nextState.domains.B1.domainState.isReduced).toBe(true);
    });

    it('stop recursion when max depth is reached', () => {
      const action = {
        type: TEST_ACTION_TYPE,
        meta: { distributeReducerOptions: { maxNestingDepth: 1 } },
      };
      const nextState = recursiveReducer(state, action);
      expect(nextState.domains.A1.domains).toBe(state.domains.A1.domains);
      expect(nextState.domains.B1.domains).toBe(state.domains.B1.domains);
    });
  });

  describe('domainsFilter option', () => {
    it('filter out even root domain', () => {
      const action = {
        type: TEST_ACTION_TYPE,
        meta: {
          distributeReducerOptions: {
            maxNestingDepth: Infinity,
            domainsFilter: () => false,
          },
        },
      };
      const nextState = recursiveReducer(state, action);
      expect(nextState.domainState).toBe(state.domainState);
      expect(nextState.domains).toBe(state.domains);
    });

    it('filter out domains that dont match regexp if filter option is string', () => {
      const action = {
        type: TEST_ACTION_TYPE,
        meta: {
          distributeReducerOptions: {
            maxNestingDepth: Infinity,
            domainsFilter: 'A',
          },
        },
      };
      const nextState = recursiveReducer(state, action);
      expect(nextState.domainState.isReduced).toBe(false);
      expect(nextState.domains.A1.domainState.isReduced).toBe(true);
      expect(nextState.domains.B1.domainState.isReduced).toBe(false);
      expect(nextState.domains.B1.domains.A2.domainState.isReduced).toBe(true);
      expect(nextState.domains.B1.domains.B2.domainState.isReduced).toBe(false);
      expect(
        nextState.domains.B1.domains.B2.domains.A3.domainState.isReduced,
      ).toBe(true);
    });
  });

  describe('identity', () => {
    it('return same state (by identity) if domains and domainsState is not changed', () => {
      const action = {
        type: NOOP_ACTION_TYPE,
        meta: {
          distributeReducerOptions: {
            maxNestingDepth: Infinity,
          },
        },
      };
      const nextState = recursiveReducer(state, action);
      expect(nextState).toBe(state);
    });

    it('return updated state for changes only in root domainState', () => {
      const action = { type: TEST_ACTION_TYPE };
      const nextState = recursiveReducer(state, action);
      expect(nextState.domainState).not.toBe(state.domainState);
      expect(nextState.domains).toBe(state.domains);
    });

    it('return updated state for changes only in nested domainState', () => {
      const action = {
        type: TEST_ACTION_TYPE,
        meta: {
          distributeReducerOptions: {
            maxNestingDepth: Infinity,
            domainsFilter: 'A3',
          },
        },
      };
      const nextState = recursiveReducer(state, action);
      expect(nextState.domainState).toBe(state.domainState);
      expect(nextState.domains.A1.domainState).toBe(
        state.domains.A1.domainState,
      );
      expect(nextState.domains.B1.domainState).toBe(
        state.domains.B1.domainState,
      );
      expect(nextState.domains.B1.domains.A2.domainState).toBe(
        state.domains.B1.domains.A2.domainState,
      );
      expect(nextState.domains.B1.domains.B2.domainState).toBe(
        state.domains.B1.domains.B2.domainState,
      );
      expect(nextState.domains.B1.domains.B2.domains.A3.domainState).not.toBe(
        state.domains.B1.domains.B2.domains.A3.domainState,
      );
    });
  });

  describe('other things', () => {
    it('consume distributed reducer options from action', () => {
      const action = {
        type: TEST_ACTION_TYPE,
        meta: {
          distributeReducerOptions: {},
          domain: 'whatever',
          whatever: 'hello',
        },
      };
      recursiveReducer(state, action);
      const targetAction = targetReducer.mock.calls[0][1];
      expect(targetAction).toEqual({
        type: TEST_ACTION_TYPE,
        meta: { whatever: 'hello' },
      });
    });
  });
});
