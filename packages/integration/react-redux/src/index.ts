import createDistributeReducer from '@request-kit/distribute-reducer';
import {
  createRequestMiddleware,
  createRequestReducer,
} from '@request-kit/controller-redux';
import createConnectedProvider, { State } from './createConnectedProvider';

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
    provide: createConnectedProvider({ selectDomainState: selector }),
    reducer: reduce,
  };
};
