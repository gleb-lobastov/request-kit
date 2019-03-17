import { schema } from 'normalizr';
import configureModels from '../index';

const modelName = 'modelNameSample';
let enhancedMockedRequest;
beforeEach(() => {
  const { requestEnhancer } = configureModels({
    modelsDefinitions: [
      {
        modelName,
        toClientAdapter: value => value,
        endpointResolver: () => '/endpoint',
        derivedSchemas: [
          {
            schemaName: 'list',
            schemaCreator: reference => new schema.Array(reference()),
          },
        ],
      },
    ],
  });

  const mockedRequest = jest.fn(({ query: { response } }) =>
    response instanceof Error
      ? Promise.reject(response)
      : Promise.resolve(response),
  );
  enhancedMockedRequest = requestEnhancer(mockedRequest);
});

describe('request middleware', () => {
  it('should process request in single-request format', async () => {
    expect.assertions(1);
    const mockedResponse = { id: 3, field: 'value' };
    const actualResponse = await enhancedMockedRequest({
      domain: 'any',
      modelName,
      query: {
        id: mockedResponse.id,
        response: mockedResponse,
      },
    });
    expect(actualResponse).toEqual({
      result: mockedResponse.id,
      entities: { [modelName]: { [mockedResponse.id]: mockedResponse } },
    });
  });

  it('should process request for custom schema', async () => {
    expect.assertions(1);
    const mockedResponse = [
      { id: 3, field: 'value3' },
      { id: 4, field: 'value4' },
      { id: 5, field: 'value5' },
    ];
    const ids = mockedResponse.map(({ id }) => id);
    const actualResponse = await enhancedMockedRequest({
      domain: 'any',
      modelName,
      query: {
        ids,
        response: mockedResponse,
      },
    });
    expect(actualResponse).toEqual({
      result: ids,
      entities: {
        [modelName]: {
          [mockedResponse[0].id]: mockedResponse[0],
          [mockedResponse[1].id]: mockedResponse[1],
          [mockedResponse[2].id]: mockedResponse[2],
        },
      },
    });
  });

  it('should ignore empty requests', async () => {
    expect.assertions(1);
    const actualResponse = await enhancedMockedRequest({
      domain: 'any',
      modelName,
      query: {
        response: null,
      },
    });
    expect(actualResponse).toBeNull();
  });
});
