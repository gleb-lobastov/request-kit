### About

Toolkit to automate data fetching in react && redux based application. Library export configuration function which returns reducer, middleware and high order component.

Request config is just passed to HOC and it's provide request state and results to wrapped component as props.

### Example use case

requestKit.js

```ecmascript 6
import configureRequestKit from '@request-kit/react-redux';
import createEngine from '@request-kit/rest-engine';

const {
  middleware,
  provide,
  reducer,
} = configureRequestKit({
  engine: createRestEngine({}),
});

export { middleware, provide, reducer, selectors}
```

store.js

```ecmascript 6
import { createStore, applyMiddleware } from 'redux';
import { middleware, reducer } from 'requestKit';

export const createStore(reducer, applyMiddleware(middleware));
```

MyComponent.js

```jsx harmony
import React from 'react';
import { provide } from 'requestKit';

class MyComponent extends React.Component {
  render() {
    const { provision, fallback, isReady, isPending, error } = this.props;
    return (
      <div>
        <div>Request result is {provision}</div>
        <div>Request error is {error}</div>
        <div>Last successful result is {fallback}</div>
        <div>Is request pending {isPending}</div>
        <div>Is request finished {isReady}</div>
      </div>
    );
  }
}

const mapStateToRequirements = state => ({
  domain: 'any',
  endpoint: `api/model/${state.currentId}`,
});

export default provide(mapStateToRequirements)(MyComponent);
```

#### Configuration

engine – realization of request-kit engine interface, currently only @request-kit/engine-rest is implemented, see package [docs](../../engine/rest/README.md#About) for details

provisionStateSelector – path to provision state in redux state. It could be dot separated string: 'paths.to.state' or function, which get root state and return provison state
