import { selectDomainState } from '../index';

const EMPTY_STATE = {};
const DEFAULT_OPTIONS = { emptyState: EMPTY_STATE };

describe('selectDomainState', () => {
  it('should return value of "state" key if no domain is specified', () => {
    const rootDomainState = {};
    const state = { domainState: rootDomainState };
    expect(selectDomainState(state)).toBe(rootDomainState);
  });

  it('should return empty state if no state present for requested domain', () => {
    const selectedDomainState = selectDomainState(
      {},
      'nonexistentDomain',
      DEFAULT_OPTIONS,
    );
    expect(selectedDomainState).toBe(EMPTY_STATE);
  });

  it('should return empty state if no state present for requested nested domain', () => {
    const selectedDomainState = selectDomainState(
      {},
      'nonexistent.domain',
      DEFAULT_OPTIONS,
    );
    expect(selectedDomainState).toBe(EMPTY_STATE);
  });

  it('should return domain state', () => {
    const domain = 'domain';
    const domainState = {};
    const state = {
      domains: {
        nonRelatedA: { domainState: {} },
        [domain]: {
          domains: { nonRelatedB: { domainState: {} } },
          domainState,
        },
      },
    };
    const selectedDomainState = selectDomainState(
      state,
      domain,
      DEFAULT_OPTIONS,
    );
    expect(selectedDomainState).toBe(domainState);
  });

  it('should return nested domain state', () => {
    const domain = 'domain';
    const subdomain = 'subdomain';
    const domainState = {};
    const state = {
      domains: {
        [domain]: {
          domains: {
            [subdomain]: {
              domainState,
            },
          },
        },
      },
    };
    const selectedDomainState = selectDomainState(
      state,
      `${domain}.${subdomain}`,
      DEFAULT_OPTIONS,
    );
    expect(selectedDomainState).toBe(domainState);
  });
});
