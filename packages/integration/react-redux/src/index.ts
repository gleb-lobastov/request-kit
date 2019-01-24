import createDistributeReducer from '@request-kit/distribute-reducer';
import {
  createRequestMiddleware,
  createRequestReducer,
} from '@request-kit/controller-redux';
import createProviderHOC, { State } from './createProviderHOC';

interface IntegrationOptions {
  engine: any;
  provisionStateSelector?: string | Function | undefined;
}

export default ({
  engine,
  provisionStateSelector = 'provision',
}: IntegrationOptions) => {
  const { reduce, selectDomainState } = createDistributeReducer({
    reducer: createRequestReducer(),
  });

  const selector = (state: State, domain = '') => {
    const domainState =
      typeof provisionStateSelector === 'function'
        ? provisionStateSelector(state)
        : state[provisionStateSelector];

    return selectDomainState(domainState, domain);
  };

  return {
    middleware: createRequestMiddleware({ engine }),
    provide: createProviderHOC({ selectDomainState: selector }),
    reducer: reduce,
  };
};
