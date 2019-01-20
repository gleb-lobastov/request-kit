import createDistributeReducer from '@request-kit/distribute-reducer';
import {
  createRequestMiddleware,
  createRequestReducer,
} from '@request-kit/controller-redux';
import createProviderHOC from './createProviderHOC';

export default ({ engine, provisionStateSelector }) => {
  const { reduce, selectDomainState } = createDistributeReducer({
    reducer: createRequestReducer(),
  });

  return {
    middleware: createRequestMiddleware({ engine }),
    provide: createProviderHOC({ selectDomainState, provisionStateSelector }),
    reducer: reduce,
  };
};
