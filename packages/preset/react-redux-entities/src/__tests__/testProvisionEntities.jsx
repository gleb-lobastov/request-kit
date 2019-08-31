import Enzyme from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import React from 'react';
import { createStore, combineReducers, applyMiddleware } from 'redux';
import { Provider } from 'react-redux';
import { mount } from 'enzyme';
import configureRequestKit from '../index';

Enzyme.configure({ adapter: new Adapter() });

const CLASS_NAME = 'CLASS_NAME';
const getResponse = (modelName, id) =>
  ({
    books: {
      10: { id: 10, author_id: 20 },
      12: { id: 12, author_id: 30 },
    },
  }[modelName][id]);
const domain = 'some.deep.path';
const mapStateToRequirements = (_, { query }) => ({
  ...query,
  meta: {
    domain,
  },
});

let store;
let ProvisionedComponent;
let booksModelDefinition;
beforeEach(() => {
  booksModelDefinition = {
    modelName: 'books',
    toClientAdapter: ({ id: bookId, author_id: authorId }) => ({
      bookId,
      authorId,
    }),
    endpointResolver: ({ query: { id } }) => `api/books/${id}`,
  };
  const { reducer, reduxMiddleware, provide } = configureRequestKit({
    requestEngineConfig: {
      fetchHandler: (endpoint, { modelName, query, query: { id } }) =>
        query instanceof Error
          ? Promise.reject(query)
          : Promise.resolve(getResponse(modelName, id)),
    },
    modelsConfig: {
      modelsDefinitions: [booksModelDefinition],
    },
  });

  store = createStore(
    combineReducers({ requestKit: reducer }),
    applyMiddleware(reduxMiddleware),
  );
  const Presenter = () => <div className={CLASS_NAME} />;
  ProvisionedComponent = provide(mapStateToRequirements)(Presenter);
});

describe('provide integration', () => {
  it('should indicate pending state after request is initiated', () => {
    const query = {
      meta: {
        domain: 'test',
      },
      request: {
        modelName: booksModelDefinition.modelName,
        query: {
          id: 10,
        },
      },
    };
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

  it.only('should receive provision after request is fulfilled', async () => {
    expect.assertions(1);
    const requiredId = 10;
    const { modelName } = booksModelDefinition;
    const query = {
      meta: {
        domain: 'test',
      },
      request: {
        modelName,
        query: {
          id: requiredId,
        },
      },
    };
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
    const presenter = instance
      .update()
      .children()
      .children()
      .children();

    console.log(JSON.stringify(store.getState(), null, 2));

    expect(presenter.props().provision).toEqual({
      value: { receive: getResponse(modelName, requiredId) },
      fallback: { receive: getResponse(modelName, requiredId) },
      isPending: false,
      isComplete: true,
      error: undefined,
    });
  });

  it('should make request for each requirements changed', async () => {
    expect.assertions(1);
    const requiredIdA = 10;
    const requiredIdB = 12;
    const { modelName } = booksModelDefinition;
    const renderProvisionedComponent = props => (
      <ProvisionedComponent {...props} />
    );
    const queryA = {
      meta: {
        domain: 'test',
      },
      request: {
        modelName,
        query: {
          id: requiredIdA,
        },
      },
    };
    const queryB = {
      meta: {
        domain: 'test',
      },
      request: {
        modelName,
        query: {
          id: requiredIdB,
        },
      },
    };
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
      value: { receive: getResponse(modelName, requiredIdA) },
      fallback: { receive: getResponse(modelName, requiredIdB) },
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
