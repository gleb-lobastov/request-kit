import distributeReducerByDomain from '../index';

const {
  selectDomainState,
  selectDomainStates,
} = distributeReducerByDomain({ reducer: () => {} });

describe('selectDomainState', () => {
  it('should return value of "state" key if no domain is specified', () => {
    const rootDomainState = {};
    const state = { domainState: rootDomainState };
    expect(selectDomainState(state)).toBe(rootDomainState);
  });

  it('should return undefined if no state present for requested domain', () => {
    expect(selectDomainState({}, 'nonexistentDomain')).toBeUndefined();
  });

  it('should return undefined if no state present for requested nested domain', () => {
    expect(selectDomainState({}, 'nonexistent.domain')).toBeUndefined();
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
    expect(selectDomainState(state, domain)).toBe(domainState);
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
    expect(selectDomainState(state, `${domain}.${subdomain}`)).toBe(domainState);
  });
});

describe('selectDomainStates', () => {
  it('should return single item array with value of "state" key if no domain is specified', () => {
    const rootDomainState = {};
    const state = { domainState: rootDomainState };
    const selectedDomainsArray = selectDomainStates(state);
    expect(selectedDomainsArray).toHaveLength(1);
    expect(selectDomainStates(state)[0]).toBe(rootDomainState);
  });

  it('should return empty array if no state present for requested domain', () => {
    expect(selectDomainStates({}, 'nonexistentDomain')).toHaveLength(0);
  });

  it('should return empty array if no state present for requested nested domain', () => {
    expect(selectDomainStates({}, 'nonexistent.domain')).toHaveLength(0);
  });

  it('should return array consist of domain state and all of it subdomains states', () => {
    const domain = 'domain';
    const domainState = { domainState: true };
    const nestedDomainStateA = { nestedDomainStateA: true };
    const nestedDomainStateB = { nestedDomainStateB: true };
    const nestedDomainStateC = { nestedDomainStateC: true };
    const state = {
      domains: {
        nonRelatedDomain: { domainState: { nonRelatedDomain: true } },
        [domain]: {
          domains: {
            nestedA: { domainState: nestedDomainStateA },
            nestedB: {
              domains: {
                nestedC: { domainState: nestedDomainStateC },
              },
              domainState: nestedDomainStateB,
            },
          },
          domainState,
        },
      },
    };
    const selectedDomainsArray = selectDomainStates(state, domain);
    expect(selectedDomainsArray).toHaveLength(4);
    expect(selectedDomainsArray).toEqual((
      expect.arrayContaining([
        domainState,
        nestedDomainStateA,
        nestedDomainStateB,
        nestedDomainStateC,
      ])
    ));
  });

  it('should ignore undefined states', () => {
    const domain = 'domain';
    const nestedDomainStateA = { nestedDomainStateA: true };
    const state = {
      domains: {
        [domain]: {
          domains: {
            nestedA: { domainState: nestedDomainStateA },
            nestedB: undefined,
            nestedC: { domainState: undefined },
          },
          domainState: undefined,
        },
      },
    };
    expect(selectDomainStates(state, domain)).toEqual([nestedDomainStateA]);
  });
});
