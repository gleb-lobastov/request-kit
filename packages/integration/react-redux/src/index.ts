import createDistributeReducer from '@request-kit/distribute-reducer';
import {
  createRequestMiddleware,
  createRequestReducer,
} from '@request-kit/controller-redux';
import createProviderHOC from './createProviderHOC';

interface IntegrationOptions {
  engine: any;
  provisionStateSelector?: string | Function | undefined;
}

export default ({ engine, provisionStateSelector }: IntegrationOptions) => {
  const { reduce, selectDomainState } = createDistributeReducer({
    reducer: createRequestReducer(),
  });

  return {
    middleware: createRequestMiddleware({ engine }),
    provide: createProviderHOC({ selectDomainState, provisionStateSelector }),
    reducer: reduce,
  };
};
