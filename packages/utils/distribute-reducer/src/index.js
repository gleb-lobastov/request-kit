const consts = {
  DOMAIN_SEPARATOR: '.',
  DOMAIN_PROPERTY_SEPARATOR: '.',
};

const defaultErrorHandler = message => {
  throw new Error(message);
};

class Distributor {
  static safelyResolveNestedDomainObject(domainObject, partitionKey) {
    if (!domainObject || !domainObject.domains) {
      return undefined;
    }
    if (
      !Object.prototype.hasOwnProperty.call(domainObject.domains, partitionKey)
    ) {
      return undefined;
    }
    return domainObject.domains[partitionKey];
  }

  constructor(options) {
    const {
      domainSeparator = consts.DOMAIN_SEPARATOR,
      domainProperty = 'meta.domain',
      onError: handleError = defaultErrorHandler,
      reducer: wrappedReducer,
    } = options;

    this.handleError = handleError;
    this.domainSeparator = domainSeparator;
    if (typeof wrappedReducer !== 'function') {
      this.handleError(
        `invalid option reducer is specified "${wrappedReducer}", expected function`,
      );
    }
    this.wrappedReducer = wrappedReducer;

    if (typeof domainProperty === 'function') {
      this.resolveDomain = domainProperty;
    } else if (typeof domainProperty === 'string') {
      this.resolveDomain = action =>
        domainProperty
          .split(consts.DOMAIN_PROPERTY_SEPARATOR)
          .reduce((obj, attr) => obj && obj[attr], action);
    } else {
      this.handleError(
        `invalid domainProperty "${domainProperty}" specified, expected func or string`,
      );
    }
  }

  resolveDomainPartitions(domain = '') {
    return domain.split(this.domainSeparator).filter(Boolean);
  }

  reduce(prevRootState = {}, action) {
    const domain = this.resolveDomain(action);
    if (!domain) {
      return prevRootState;
    }
    const nextRootState = { ...prevRootState };
    let prevWindow = prevRootState;
    let nextWindow = nextRootState;

    const parts = this.resolveDomainPartitions(domain).reverse();
    while (parts.length) {
      const partitionKey = parts.pop();
      nextWindow.domains = {
        ...(prevWindow && prevWindow.domains),
        [partitionKey]: {
          ...Distributor.safelyResolveNestedDomainObject(
            prevWindow,
            partitionKey,
          ),
        },
      };
      prevWindow = Distributor.safelyResolveNestedDomainObject(
        prevWindow,
        partitionKey,
      );
      nextWindow = nextWindow.domains[partitionKey];
    }
    nextWindow.domainState = this.wrappedReducer(
      nextWindow.domainState,
      action,
    );
    if (prevWindow && nextWindow.domainState === prevWindow.domainState) {
      return prevRootState; // nothing was changed
    }
    return nextRootState;
  }

  selectDomainObject(rootState, domain) {
    if (!domain) {
      return rootState;
    }
    return this.resolveDomainPartitions(domain).reduce(
      Distributor.safelyResolveNestedDomainObject,
      rootState,
    );
  }

  selectDomainState(rootState, domain) {
    const { domainState } = this.selectDomainObject(rootState, domain) || {};
    return domainState;
  }

  selectNestedDomainStates(rootState, domain) {
    const baseState = domain
      ? this.selectDomainState(rootState, domain)
      : rootState;
    if (!baseState || !baseState.domains) {
      return [];
    }
    return [].concat(
      ...Object.keys(baseState.domains).map(partitionKey =>
        this.selectDomainStates(
          Distributor.safelyResolveNestedDomainObject(baseState, partitionKey),
        ),
      ),
    );
  }

  selectDomainStates(rootState, domain) {
    const baseDomainObject = this.selectDomainObject(rootState, domain);
    const nestedDomainObjects = this.selectNestedDomainStates(baseDomainObject);
    if (!baseDomainObject || !baseDomainObject.domainState) {
      return nestedDomainObjects;
    }
    return [baseDomainObject.domainState, ...nestedDomainObjects];
  }
}

const distributeReducer = options => {
  const distributor = new Distributor(options);
  return {
    reduce: (state, action) => distributor.reduce(state, action),
    selectDomainState: (state, domain) =>
      distributor.selectDomainState(state, domain),
    selectDomainStates: (state, domain) =>
      distributor.selectDomainStates(state, domain),
  };
};

distributeReducer.consts = consts;
export default distributeReducer;
