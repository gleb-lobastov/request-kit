import { selectDomainStates } from '../index';

const EMPTY_STATE = {};
const DEFAULT_OPTIONS = { emptyState: EMPTY_STATE };

describe('selectDomainStates', () => {
  it('should return single item array with value of "state" key if no domain is specified', () => {
    const rootDomainState = {};
    const state = { domainState: rootDomainState };
    const selectedDomainsMapping = selectDomainStates(state);
    expect(Object.keys(selectedDomainsMapping)).toHaveLength(1);
    expect(selectedDomainsMapping['']).toBe(rootDomainState);
  });

  it('should return empty state if no state present for requested domain', () => {
    const nonexistentDomain = 'nonexistentDomain';
    const selectedDomainsMapping = selectDomainStates(
      {},
      'nonexistentDomain',
      DEFAULT_OPTIONS,
    );
    expect(selectedDomainsMapping).toEqual({
      [nonexistentDomain]: EMPTY_STATE,
    });
  });

  it('should return empty state if no state present for requested nested domain', () => {
    const nonexistentDomain = 'nonexistent.domain';
    const selectedDomainsMapping = selectDomainStates(
      {},
      nonexistentDomain,
      DEFAULT_OPTIONS,
    );
    expect(selectedDomainsMapping).toEqual({
      [nonexistentDomain]: EMPTY_STATE,
    });
  });

  it('should return flatten object of domain state and all of it subdomains states', () => {
    const domain = 'domain';
    const nestedA = 'nestedA';
    const nestedB = 'nestedB';
    const nestedC = 'nestedC';
    const domainState = { domainState: true };
    const nestedDomainStateA = { nestedDomainStateA: true };
    const nestedDomainStateB = { nestedDomainStateB: true };
    const nestedDomainStateC = { nestedDomainStateC: true };
    const state = {
      domains: {
        nonRelatedDomain: { domainState: { nonRelatedDomain: true } },
        [domain]: {
          domains: {
            [nestedA]: { domainState: nestedDomainStateA },
            [nestedB]: {
              domains: {
                [nestedC]: { domainState: nestedDomainStateC },
              },
              domainState: nestedDomainStateB,
            },
          },
          domainState,
        },
      },
    };
    const selectedDomainsMapping = selectDomainStates(
      state,
      domain,
      DEFAULT_OPTIONS,
    );
    expect(selectedDomainsMapping).toEqual({
      [domain]: domainState,
      [`${domain}.${nestedA}`]: nestedDomainStateA,
      [`${domain}.${nestedB}`]: nestedDomainStateB,
      [`${domain}.${nestedB}.${nestedC}`]: nestedDomainStateC,
    });
  });

  it('should ignore undefined states', () => {
    const domain = 'domain';
    const nestedA = 'nestedA';
    const nestedB = 'nestedB';
    const nestedC = 'nestedC';
    const nestedDomainStateA = { nestedDomainStateA: true };
    const state = {
      domains: {
        [domain]: {
          domains: {
            nestedA: { domainState: nestedDomainStateA },
            nestedB: undefined,
            nestedC: { domainState: undefined },
          },
          domainState: null,
        },
      },
    };
    expect(selectDomainStates(state, domain, DEFAULT_OPTIONS)).toEqual({
      [`${domain}`]: null,
      [`${domain}.${nestedA}`]: nestedDomainStateA,
      [`${domain}.${nestedB}`]: EMPTY_STATE,
      [`${domain}.${nestedC}`]: EMPTY_STATE,
    });
  });

  it('should return flatten filtered object of domain state and all of it subdomains states', () => {
    const domain = 'domain';
    const nestedA = 'nestedA';
    const nestedB = 'nestedB';
    const nestedC = 'nestedC';
    const domainState = { domainState: true };
    const nestedDomainStateA = { nestedDomainStateA: true };
    const nestedDomainStateB = { nestedDomainStateB: true };
    const nestedDomainStateC = { nestedDomainStateC: true };
    const state = {
      domains: {
        nonRelatedDomain: { domainState: { nonRelatedDomain: true } },
        [domain]: {
          domains: {
            [nestedA]: { domainState: nestedDomainStateA },
            [nestedB]: {
              domains: {
                [nestedC]: { domainState: nestedDomainStateC },
              },
              domainState: nestedDomainStateB,
            },
          },
          domainState,
        },
      },
    };
    const selectedDomainsMapping = selectDomainStates(state, domain, {
      ...DEFAULT_OPTIONS,
      domainsFilter: `nestedA|nestedC`,
    });
    expect(selectedDomainsMapping).toEqual({
      [`${domain}.${nestedA}`]: nestedDomainStateA,
      [`${domain}.${nestedB}.${nestedC}`]: nestedDomainStateC,
    });
  });
});
