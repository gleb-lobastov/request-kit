import { schema } from 'normalizr';
import ModelsSet from '../ModelsSet';

let models;
beforeEach(() => {
  const createListSchemaFromThisModelItemSchema = reference =>
    new schema.Array(reference());
  const createDerivedSchemaFromPreviouslyDefinedListSchema = reference =>
    new schema.Object({ data: reference({ schemaName: 'list' }) });
  const referenceToItemSchemaOfAnotherModel = reference =>
    reference({ modelName: 'referenceModel' });
  const createDerivedSchemaFromPreviouslyDefinedAnotherModelSchema = reference =>
    new schema.Object({
      data: reference({ schemaName: 'referenceModelItem' }),
    });
  const referenceListSchemaFromAnotherModelItemSchema = reference =>
    reference({ modelName: 'referenceModel', schemaName: 'list' });
  const createListSchemaFromAnotherModelItemSchema = reference =>
    new schema.Array(reference({ modelName: 'referenceModel' }));

  const modelsSet = new ModelsSet({
    modelsDefinitions: [
      {
        modelName: 'referenceModel',
        toClientAdapter: value => value,
        endpointResolver: null,
        derivedSchemas: [
          {
            schemaName: 'list',
            schemaCreator: createListSchemaFromThisModelItemSchema,
          },
        ],
      },
      {
        modelName: 'referencingModel',
        // toServerAdapter: value => value,
        toClientAdapter: value => value,
        endpointResolver: null,
        derivedSchemas: [
          {
            schemaName: 'list',
            schemaCreator: createListSchemaFromThisModelItemSchema,
          },
          {
            schemaName: 'objectWithList',
            schemaCreator: createDerivedSchemaFromPreviouslyDefinedListSchema,
          },
          {
            schemaName: 'referenceModelItem',
            schemaCreator: referenceToItemSchemaOfAnotherModel,
          },
          {
            schemaName: 'objectWithModelItem',
            schemaCreator: createDerivedSchemaFromPreviouslyDefinedAnotherModelSchema,
          },
          {
            schemaName: 'referenceModelList',
            schemaCreator: referenceListSchemaFromAnotherModelItemSchema,
          },
          {
            schemaName: 'customReferenceModelList',
            schemaCreator: createListSchemaFromAnotherModelItemSchema,
          },
        ],
      },
    ],
  });
  models = {
    referenceModel: modelsSet.resolveByName('referenceModel'),
    referencingModel: modelsSet.resolveByName('referencingModel'),
  };
});

describe('derived schemas', () => {
  it('should define item schema in reference model', () => {
    const { referenceModel } = models;
    expect(referenceModel.itemSchema).toBeInstanceOf(schema.Entity);
  });
  it('should define list schema in reference model that based on reference model item', () => {
    const { referenceModel } = models;
    expect(referenceModel.derivedSchemas.list).toBeInstanceOf(schema.Array);
    expect(referenceModel.derivedSchemas.list.schema).toBe(
      referenceModel.itemSchema,
    );
  });
  it('should define list schema in derivedSchemasModel that based on derivedSchemasModel item', () => {
    const { referencingModel } = models;
    expect(referencingModel.derivedSchemas.list).toBeInstanceOf(schema.Array);
    expect(referencingModel.derivedSchemas.list.schema).toBe(
      referencingModel.itemSchema,
    );
  });
  it('should define objectWithList schema in derivedSchemasModel that have a field, that reference list schema of derivedSchemasModel', () => {
    const { referencingModel } = models;
    expect(referencingModel.derivedSchemas.objectWithList).toBeInstanceOf(
      schema.Object,
    );
    expect(referencingModel.derivedSchemas.objectWithList.schema.data).toBe(
      referencingModel.derivedSchemas.list,
    );
  });
  it('should define referenceModelItem schema in derivedSchemasModel that reference reference model item schema', () => {
    const { referenceModel, referencingModel } = models;
    expect(referencingModel.derivedSchemas.referenceModelItem).toBe(
      referenceModel.itemSchema,
    );
  });
  it('should define referenceModelList schema in derivedSchemasModel that reference reference model list schema', () => {
    const { referenceModel, referencingModel } = models;
    expect(referencingModel.derivedSchemas.referenceModelList).toBe(
      referenceModel.derivedSchemas.list,
    );
  });
  it('should define objectWithModelItem schema in derivedSchemasModel that have a field, that reference reference model item schema', () => {
    const { referenceModel, referencingModel } = models;
    expect(referencingModel.derivedSchemas.objectWithModelItem).toBeInstanceOf(
      schema.Object,
    );
    expect(
      referencingModel.derivedSchemas.objectWithModelItem.schema.data,
    ).toBe(referenceModel.itemSchema);
  });
  it('should define customModelList schema in derivedSchemasModel that represent reference model item schema as array', () => {
    const { referenceModel, referencingModel } = models;
    expect(
      referencingModel.derivedSchemas.customReferenceModelList,
    ).toBeInstanceOf(schema.Array);
    expect(
      referencingModel.derivedSchemas.customReferenceModelList.schema,
    ).toBe(referenceModel.itemSchema);
  });
});
