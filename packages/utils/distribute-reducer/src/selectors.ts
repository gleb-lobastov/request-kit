import {
  IDomainCompositeState,
  IDomainPath,
  ISelectorOptions,
  IAdaptedSelectorOptions,
  IDomainStatesMapping,
} from './interface';
import {
  resolveNestedPath,
  resolveDomainPathPartitions,
  domainsFilterAdapter,
} from './utils';

export const selectNestedDomain = <IDomainState>(
  domain?: IDomainCompositeState<IDomainState>,
  pathPartition: string = '',
): IDomainCompositeState<IDomainState> | undefined => {
  if (!domain || !domain.domains) {
    return undefined;
  }
  return domain.domains[pathPartition];
};

export const selectDomain = <IDomainState>(
  rootDomain: IDomainCompositeState<IDomainState>,
  domainPath: IDomainPath,
): IDomainCompositeState<IDomainState> | undefined => {
  if (!domainPath) {
    return rootDomain;
  }
  return resolveDomainPathPartitions(domainPath).reduce(
    selectNestedDomain,
    rootDomain,
  );
};

export const selectDomainState = <IDomainState, IEmptyState>(
  rootDomain: IDomainCompositeState<IDomainState>,
  domainPath: IDomainPath,
  { emptyState = {} }: ISelectorOptions<IEmptyState> = {},
) => {
  const domain = selectDomain(rootDomain, domainPath);
  if (!domain) {
    return emptyState;
  }
  const { domainState = emptyState } = domain;
  return domainState;
};

const selectNestedDomainStates = <IDomainState, IEmptyState>(
  baseDomain?: IDomainCompositeState<IDomainState>,
  baseDomainPath: IDomainPath = '',
  { domainsFilter, emptyState }: IAdaptedSelectorOptions<IEmptyState> = {},
): IDomainStatesMapping<IDomainState> => {
  const shouldIgnoreDomain = domainsFilter
    ? !domainsFilter(baseDomainPath)
    : false;
  if (!baseDomain) {
    return shouldIgnoreDomain ? {} : { [baseDomainPath]: emptyState };
  }
  const { domainState = emptyState } = baseDomain;
  const baseMapping = shouldIgnoreDomain
    ? {}
    : { [baseDomainPath]: domainState };
  if (!baseDomain.domains) {
    return baseMapping;
  }
  const nestedStatesMappings = Object.keys(baseDomain.domains).map(
    pathPartition =>
      selectNestedDomainStates(
        selectNestedDomain(baseDomain, pathPartition),
        resolveNestedPath(baseDomainPath, pathPartition),
        {
          domainsFilter,
          emptyState,
        },
      ),
  );
  return Object.assign(baseMapping, ...nestedStatesMappings);
};

export const selectDomainStates = <IDomainState, IEmptyState>(
  baseDomain: IDomainCompositeState<IDomainState>,
  basePath: IDomainPath = '',
  { domainsFilter, emptyState = {} }: ISelectorOptions<IEmptyState> = {},
) =>
  selectNestedDomainStates(selectDomain(baseDomain, basePath), basePath, {
    domainsFilter: domainsFilterAdapter(domainsFilter),
    emptyState,
  });
