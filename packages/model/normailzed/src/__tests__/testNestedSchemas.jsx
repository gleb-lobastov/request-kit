import ModelsSet from '../ModelsSet';

let models;
beforeEach(() => {
  const nestedModelItemRef = reference =>
    reference({ modelName: 'nestedModel' });
  const nestedModelListRef = reference =>
    reference({ modelName: 'nestedModel', schemaName: 'list' });

  const modelsSet = new ModelsSet({
    modelsDefinitions: [
      {
        modelName: 'nestedModel',
        toClientAdapter: value => value,
        endpointResolver: null,
        derivedSchemas: [
          {
            schemaName: 'list',
            schemaCreator: reference => new Array(reference()),
          },
        ],
      },
      {
        modelName: 'nestingModel',
        toClientAdapter: value => value,
        endpointResolver: null,
        schema: {
          definition: {
            nestedModelItem: nestedModelItemRef,
            nestedModelList: nestedModelListRef,
          },
          options: {},
        },
      },
    ],
  });
  models = {
    nestingModel: modelsSet.resolveByName('nestingModel'),
    nestedModel: modelsSet.resolveByName('nestedModel'),
  };
});

describe('schemas', () => {
  it('should reference item schema of nested model', () => {
    const { nestedModel, nestingModel } = models;
    expect(nestingModel.itemSchema.schema.nestedModelItem).toBe(
      nestedModel.itemSchema,
    );
  });
  it('should reference list schema of nested model', () => {
    const { nestedModel, nestingModel } = models;
    expect(nestingModel.itemSchema.schema.nestedModelList).toBe(
      nestedModel.derivedSchemas.list,
    );
  });
});
