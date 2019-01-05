/**
 * remove prior to v1.0.0
 * @deprecated use DistributorOptions instead
 */
interface PrevDistributorOptionsFormat {
  domainSeparator?: string; // DistributorOptions.pathPartitionsSeparator
  domainProperty?: string | DomainPathResolver; // DistributorOptions.pathProperty
  reducer: TargetReducer; // DistributorOptions.targetReducer
}

interface DistributorOptions {
  pathPartitionsSeparator?: string;
  pathProperty?: string | DomainPathResolver;
  targetReducer: TargetReducer;
}

type Optional<T> = T | undefined;

// State and a action is "bypass" props and not allowed to be disclosed inside this lob
interface ForwardedState {}
interface ForwardedAction {}

type TargetReducer = (
  state: Optional<ForwardedState>,
  action: ForwardedAction,
) => ForwardedState;

type DomainPathResolver = (action: ForwardedAction) => string;

/**
 * Domain - part of state object, that represent branch (even root) of domain tree
 *
 * domain state is encapsulated state, which is not accessible from this lib, but
 * is a source to pass to targetReducer
 */
type Domain = {
  domains?: { [pathPartition: string]: Domain };
  domainState?: ForwardedState;
};

const consts = {
  PATH_PARTITIONS_SEPARATOR: '.',
  DOMAIN_PROPERTY_SEPARATOR: '.',
  DEFAULT_PATH: 'meta.domain',
};

const createDefaultDomainPathResolver = (pathProperty: string) => (
  action: ForwardedAction,
) =>
  pathProperty
    .split(consts.DOMAIN_PROPERTY_SEPARATOR)
    .reduce((obj: any, attr: string) => obj && obj[attr], action);

const getNestedDomain = (domain: Optional<Domain>, pathPartition: string) => {
  if (!domain || !domain.domains) {
    return undefined;
  }
  return domain.domains[pathPartition];
};

class Distributor {
  pathPartitionsSeparator: string;
  resolveDomainPath: DomainPathResolver;
  targetReducer: TargetReducer;

  constructor(options: DistributorOptions) {
    const {
      pathPartitionsSeparator = consts.PATH_PARTITIONS_SEPARATOR,
      pathProperty = consts.DEFAULT_PATH,
      targetReducer,
    } = options;

    this.pathPartitionsSeparator = pathPartitionsSeparator;
    if (typeof targetReducer !== 'function') {
      throw new Error(
        `invalid option targetReducer is specified "${targetReducer}", expected function`,
      );
    }
    this.targetReducer = targetReducer;

    if (typeof pathProperty === 'function') {
      this.resolveDomainPath = pathProperty;
    } else if (typeof pathProperty === 'string') {
      this.resolveDomainPath = createDefaultDomainPathResolver(pathProperty);
    } else {
      throw new Error(
        `invalid pathProperty "${pathProperty}" specified, expected func or string`,
      );
    }
  }

  resolveDomainPathPartitions(domainPath: string = '') {
    return domainPath.split(this.pathPartitionsSeparator).filter(Boolean);
  }

  selectDomain(
    rootDomain: Optional<Domain>,
    domainPath?: string,
  ): Optional<Domain> {
    if (!domainPath) {
      return rootDomain;
    }
    return this.resolveDomainPathPartitions(domainPath).reduce(
      getNestedDomain,
      rootDomain,
    );
  }

  selectNestedDomainStates(baseDomain: Optional<Domain>): ForwardedState[] {
    if (!baseDomain) {
      return [];
    }
    if (!baseDomain.domains) {
      return [baseDomain.domainState];
    }
    return [].concat(
      baseDomain.domainState,
      ...Object.keys(baseDomain.domains).map((pathPartition: string) =>
        this.selectNestedDomainStates(
          getNestedDomain(baseDomain, pathPartition),
        ),
      ),
    );
  }

  selectDomainState(rootDomain: Optional<Domain>, domainPath: string) {
    const domain = this.selectDomain(rootDomain, domainPath);
    if (!domain) {
      return undefined;
    }
    const { domainState } = domain;
    return domainState;
  }

  selectDomainStates(
    rootDomain: Optional<Domain>,
    domain?: string,
  ): ForwardedState[] {
    return this.selectNestedDomainStates(this.selectDomain(rootDomain, domain));
  }

  reduce(prevRootDomain: Optional<Domain> = {}, action: ForwardedAction) {
    const domainPath = this.resolveDomainPath(action);
    if (!domainPath) {
      return prevRootDomain;
    }
    const nextRootDomain = { ...prevRootDomain };
    let windowOfPrevState: Optional<Domain> = prevRootDomain;
    let windowOfNextState: Domain = nextRootDomain;

    const partitions = this.resolveDomainPathPartitions(domainPath).reverse();
    while (partitions.length) {
      const pathPartition = partitions.pop()!;
      const movedWindowOfPrevState = getNestedDomain(
        windowOfPrevState,
        pathPartition,
      );
      windowOfNextState.domains = {
        ...(windowOfPrevState && windowOfPrevState.domains),
        [pathPartition]: { ...movedWindowOfPrevState },
      };
      windowOfNextState = windowOfNextState.domains[pathPartition];
      windowOfPrevState = movedWindowOfPrevState;
    }
    windowOfNextState.domainState = this.targetReducer(
      windowOfNextState.domainState,
      action,
    );
    if (
      windowOfPrevState &&
      windowOfNextState.domainState === windowOfPrevState.domainState
    ) {
      return prevRootDomain; // nothing was changed
    }
    return nextRootDomain;
  }
}

const createDistributeReducer = (options: PrevDistributorOptionsFormat) => {
  const { domainSeparator, domainProperty, reducer } = options;
  const distributor = new Distributor({
    pathPartitionsSeparator: domainSeparator,
    pathProperty: domainProperty,
    targetReducer: reducer,
  });
  return {
    reduce: (state: Domain, action: ForwardedAction) =>
      distributor.reduce(state, action),
    selectDomainState: (state: Domain, domainPath: string) =>
      distributor.selectDomainState(state, domainPath),
    selectDomainStates: (state: Domain, domainPath: string) =>
      distributor.selectDomainStates(state, domainPath),
  };
};

createDistributeReducer.consts = consts;
export default createDistributeReducer;
