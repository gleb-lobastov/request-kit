import { IDomainCompositeState, IAction, IReducer } from '../interface';
import { resolveDomainPathPartitions } from '../utils';
import { selectNestedDomain } from '../selectors';

export default <
  IOriginalReducer extends IReducer<IDomainCompositeState<IDomainState>>,
  IDomainState
>(
  originalReducer: IOriginalReducer,
) => (
  prevRootState: IDomainCompositeState<IDomainState> | undefined,
  action: IAction,
) => {
  const { meta: { domain: domainPath = undefined } = {} } = action;
  const nextRootState = { domains: {}, ...prevRootState };
  let windowOfPrevState = prevRootState;
  let windowOfNextState: IDomainCompositeState<IDomainState> = nextRootState;

  if (domainPath) {
    const partitions = resolveDomainPathPartitions(domainPath).reverse();
    while (partitions.length) {
      const pathPartition = partitions.pop() as string;
      const movedWindowOfPrevState = selectNestedDomain(
        windowOfPrevState,
        pathPartition,
      );

      windowOfNextState.domains = {
        ...((windowOfPrevState && windowOfPrevState.domains) || {}),
        [pathPartition]: { domains: {}, ...movedWindowOfPrevState },
      };

      // represent previous state, could be undefined
      windowOfPrevState = movedWindowOfPrevState;
      // newly created copy of prev state, always an object
      // note: mutations is allowed (only) inside this func
      windowOfNextState = windowOfNextState.domains[pathPartition] || {
        domains: {},
      };
    }
  }

  const nextState = originalReducer(windowOfPrevState, action);
  const isDomainsChanged = !Object.is(
    nextState.domains,
    windowOfPrevState && windowOfPrevState.domains,
  );
  const isDomainStateChanged = !Object.is(
    nextState.domainState,
    windowOfPrevState && windowOfPrevState.domainState,
  );

  if (!isDomainsChanged && !isDomainStateChanged) {
    // if nothing was changed, previous state will be returned (keep identity)
    return prevRootState;
  }
  if (isDomainsChanged) {
    windowOfNextState.domains = nextState.domains;
  }
  if (isDomainStateChanged) {
    windowOfNextState.domainState = nextState.domainState;
  }

  return nextRootState;
};
