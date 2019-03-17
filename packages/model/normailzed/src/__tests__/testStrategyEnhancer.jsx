import configureModels from '../index';

const topLevelParam = 'topLevelParam';
const requestLevelParam = 'requestLevelParam';
const modelName = 'modelName';

let strategy;
let enhancedStrategy;
beforeEach(() => {
  const { strategyEnhancer } = configureModels({
    availableSchemaDerivatives: [],
    modelsDefinitions: [
      {
        modelName,
        toClientAdapter: value => value,
        endpointResolver: () => '/endpoint',
      },
    ],
  });

  strategy = jest.fn(request => Promise.resolve(request));
  enhancedStrategy = strategyEnhancer(strategy);
});

describe('request middleware', () => {
  it('should call strategy in single-request format', async () => {
    expect.assertions(1);
    await enhancedStrategy({
      topLevelParam,
      request: {
        modelName,
        query: { id: 1 },
        requestLevelParam,
      },
    });
    expect(strategy.mock.calls).toEqual([
      [
        expect.objectContaining({
          modelName,
          query: { id: 1 },
          topLevelParam,
          requestLevelParam,
        }),
      ],
    ]);
  });

  it('should call strategy in multiple-requests format', async () => {
    expect.assertions(1);
    await enhancedStrategy({
      topLevelParam,
      requests: {
        [modelName]: {
          modelName,
          query: { id: 1 },
          requestLevelParam,
        },
      },
    });
    expect(strategy.mock.calls).toEqual([
      [
        expect.objectContaining({
          modelName,
          query: { id: 1 },
          topLevelParam,
          requestLevelParam,
        }),
      ],
    ]);
  });

  it('should call strategy multiple times in multi-request format', async () => {
    expect.assertions(1);
    await enhancedStrategy({
      topLevelParam,
      requests: {
        [modelName]: {
          modelName,
          query: { id: 1 },
          requestLevelParam,
        },
        customKey: {
          modelName,
          query: { id: 2 },
          requestLevelParam,
        },
      },
    });
    expect(strategy.mock.calls).toEqual([
      [
        expect.objectContaining({
          modelName,
          query: { id: 1 },
          topLevelParam,
          requestLevelParam,
        }),
      ],
      [
        expect.objectContaining({
          modelName,
          query: { id: 2 },
          topLevelParam,
          requestLevelParam,
        }),
      ],
    ]);
  });
});
