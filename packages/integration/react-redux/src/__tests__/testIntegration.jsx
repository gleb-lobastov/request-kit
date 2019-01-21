import React from 'react';
import { createStore, applyMiddleware } from 'redux';
import { Provider } from 'react-redux';
import { mount } from 'enzyme';
import configureRequestKit from '../index.ts';

const CLASS_NAME = 'CLASS_NAME';
const getResponse = require => `response for: ${require}`;
const domain = 'some.deep.path';
const mapStateToRequirements = (_, { query }) => ({
  query,
  meta: {
    domain,
  },
});

let requestKit;
let store;
let ProvisionedComponent;
beforeEach(() => {
  requestKit = configureRequestKit({
    engine: {
      preset() {
        return this;
      },
      request: ({ query }) =>
        query instanceof Error
          ? Promise.reject(query)
          : Promise.resolve({ receive: getResponse(query) }),
    },
    provisionStateSelector: state => state,
  });

  store = createStore(
    requestKit.reducer,
    applyMiddleware(requestKit.middleware),
  );

  const Presenter = () => <div className={CLASS_NAME} />;
  ProvisionedComponent = requestKit.provide(mapStateToRequirements)(Presenter);
});

describe('provide integration', () => {
  it('should indicate pending state after request is initiated', () => {
    const query = 'query';
    const instance = mount(
      <Provider store={store}>
        <ProvisionedComponent query={query} />,
      </Provider>,
    );

    const presenter = instance
      .children()
      .children()
      .children();

    expect(presenter.props().provision).toEqual({
      value: undefined,
      fallback: undefined,
      isPending: true,
      isComplete: false,
      error: undefined,
    });
  });

  it('should receive provision after request is fulfilled', async () => {
    expect.assertions(1);
    const query = 'query';
    const requestFulfilmentPromise = new Promise(resolve => {
      const instance = mount(
        <Provider store={store}>
          <ProvisionedComponent
            query={query}
            onRequest={promise => promise.finally(() => resolve(instance))}
          />
        </Provider>,
      );
    });
    const instance = await requestFulfilmentPromise;
    await new Promise(r => setTimeout(r, 500));
    const presenter = instance
      .update()
      .children()
      .children()
      .children();

    console.log(presenter.props());
    expect(presenter.props().provision).toEqual({
      value: { receive: getResponse(query) },
      fallback: { receive: getResponse(query) },
      isPending: false,
      isComplete: true,
      error: undefined,
    });
  });

  it('should make request for each requirements changed', async () => {
    expect.assertions(1);
    const renderProvisionedComponent = props => (
      <ProvisionedComponent {...props} />
    );
    const queryA = 'queryA';
    const queryB = 'queryB';
    const requestState = { isFirstRequest: true };
    const requestFulfilmentPromise = new Promise(resolve => {
      let instance;

      const requestHandler = promise =>
        promise.finally(() => {
          if (requestState.isFirstRequest) {
            instance.update();
            instance.setProps({
              children: renderProvisionedComponent({
                query: queryB,
                onRequest: requestHandler,
              }),
            });
            requestState.isFirstRequest = false;
          } else {
            resolve(instance);
          }
        });

      instance = mount(
        <Provider store={store}>
          {renderProvisionedComponent({
            query: queryA,
            onRequest: requestHandler,
          })}
        </Provider>,
      );
    });
    const instance = await requestFulfilmentPromise;
    const presenter = instance
      .update()
      .children()
      .children()
      .children();

    expect(presenter.props().provision).toEqual({
      value: { receive: getResponse(queryB) },
      fallback: { receive: getResponse(queryB) },
      isPending: false,
      isComplete: true,
      error: undefined,
    });
  });

  it('should receive error after request is failed', async () => {
    expect.assertions(1);
    const error = new Error('Oops');
    const requestFulfilmentPromise = new Promise(resolve => {
      const instance = mount(
        <Provider store={store}>
          <ProvisionedComponent
            query={error}
            onRequest={promise => promise.finally(() => resolve(instance))}
          />
        </Provider>,
      ).children();
    });
    const instance = await requestFulfilmentPromise;
    const presenter = instance
      .update()
      .children()
      .children()
      .children();

    expect(presenter.props().provision).toEqual({
      value: undefined,
      fallback: undefined,
      isPending: false,
      isComplete: true,
      error,
    });
  });
});
