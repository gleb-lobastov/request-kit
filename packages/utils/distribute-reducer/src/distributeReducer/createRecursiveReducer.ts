import {
  IDomainCompositeState,
  IAction,
  IReducer,
  IStepParams,
} from '../interface';
import { domainsFilterAdapter, isShallowEqual, mapValues } from '../utils';

export default <IOriginalReducer extends IReducer<IDomainState>, IDomainState>(
  originalReducer: IOriginalReducer,
) => (
  rootDomainCompositeState: IDomainCompositeState<IDomainState> | undefined,
  {
    meta: {
      domain: baseDomainPath = '',
      distributeReducerOptions = {},
      ...restMeta
    } = {},
    ...restAction
  }: IAction = {},
) => {
  const { maxNestingDepth = 0, domainsFilter } = distributeReducerOptions;

  const actualAction = { ...restAction, meta: restMeta };
  const actualDomainsFilter = domainsFilterAdapter(domainsFilter);

  const step = ({
    domainCompositeState = {
      domains: {},
      domainState: undefined,
    },
    domainPath,
    depth,
  }: IStepParams<IDomainState>): IDomainCompositeState<IDomainState> => {
    const { domains, domainState } = domainCompositeState;

    const shouldReduceDomainState = Boolean(actualDomainsFilter(domainPath));
    const shouldReduceDomains = Boolean(domains && depth < maxNestingDepth);

    if (!shouldReduceDomainState && !shouldReduceDomains) {
      return domainCompositeState;
    }

    const nextDomainState = shouldReduceDomainState
      ? originalReducer(domainState, actualAction)
      : domainState;

    const nextDomains = shouldReduceDomains
      ? mapValues(domains, (nestedDomainCompositeState, path) =>
          step({
            domainCompositeState: nestedDomainCompositeState,
            domainPath: `${domainPath}.${path}`,
            depth: depth + 1,
          }),
        )
      : domains;

    const isDomainsStateReduced =
      shouldReduceDomainState && nextDomainState !== domainState;
    const isDomainsReduced =
      shouldReduceDomains && !isShallowEqual(domains, nextDomains);

    if (!isDomainsStateReduced && !isDomainsReduced) {
      return domainCompositeState;
    }

    return {
      domains: isDomainsReduced ? nextDomains : domains,
      domainState: nextDomainState,
    };
  };

  return step({
    domainCompositeState: rootDomainCompositeState,
    domainPath: baseDomainPath,
    depth: 0,
  });
};
