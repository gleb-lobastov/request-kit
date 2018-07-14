### About

Controller to invoke remote requests calls through redux middleware. Also reducer provided to keep request state in redux store.

### Example use case

```ecmascript 6
import createRequestEngine from '@request-kit/engine-rest';
import {createRequestMiddleware,requestReducer} from '@request-kit/controller-redux';

const requestMiddleware = createRequestMiddleware({
  engine: createRequestEngine({}),
});
const store = createStore(
  combineReducers({
    requests: requestReducer,
  }),
  applyMiddleware(requestMiddleware)
);
store.dispatch(createRequestAction({ endpoint: '/echo'}));
```
