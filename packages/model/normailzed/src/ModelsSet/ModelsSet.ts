import Model from '../Model/Model';
import {
  IModelRequest,
  IModelResponse,
  IModelDefinition,
  IReferenceDeterminant,
  IReferenceResolverCreatorConfig,
} from '../Model';
import { IModelsConfig, IModelsMap } from './ModelsSet.interface';

export default class ModelsSet {
  models: IModelsMap;

  constructor(modelsConfig: IModelsConfig) {
    const { modelsDefinitions } = modelsConfig;
    // step-by-step definitions of model is required to provide references for existing schemas
    this.models = {};
    modelsDefinitions
      .filter(({ modelName }) => modelName)
      .forEach(
        (definition: IModelDefinition): void => {
          this.models[definition.modelName] = new Model(
            definition,
            this.createReferenceResolver,
          );
        },
      );
  }

  createReferenceResolver = ({
    defaultModel,
    itemSchema,
    derivedSchemas,
  }: IReferenceResolverCreatorConfig = {}) => ({
    modelName = defaultModel,
    schemaName,
  }: IReferenceDeterminant = {}) => {
    if (!modelName) {
      return undefined;
    }
    if (modelName === defaultModel) {
      if (!itemSchema || !derivedSchemas) {
        return undefined;
      }
      return schemaName ? derivedSchemas[schemaName] : itemSchema;
    }
    const model = this.resolveByName(modelName);
    if (!model) {
      throw new Error(
        `Model ${modelName} is not defined. This is possible when trying to access model that defined after current in model config. Check models definitions order`,
      );
    }
    return schemaName
      ? model.resolveSchemaByName(schemaName)
      : model.resolveEntitySchema();
  };

  resolveByName(modelName: string) {
    return this.models[modelName];
  }

  requireByName(modelName: string) {
    const model = this.resolveByName(modelName);
    if (!model) {
      throw new Error(`Missing model for "${modelName}"`);
    }
    return model;
  }

  normalize(request: IModelRequest, response: IModelResponse) {
    const { modelName } = request;
    return this.requireByName(modelName).normalize(request, response);
  }
}
