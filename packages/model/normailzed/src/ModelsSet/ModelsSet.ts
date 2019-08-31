import Model from '../Model';
/* eslint-disable no-unused-vars */
import { TModelDefinitions, TModelsMap } from './ModelsSet.interface';
import {
  TModelResponse,
  TReferenceResolverCreatorConfig,
  TReferenceDeterminant,
} from '../Model/Model.interface';
import { TModelRequirements } from '../interface';
/* eslint-enable no-unused-vars */

export default class ModelsSet<TRequirements> {
  models: TModelsMap;

  constructor(modelsDefinitions: TModelDefinitions) {
    // step-by-step definitions of model is required to provide references for existing schemas
    this.models = {};
    modelsDefinitions
      .filter(({ modelName }) => modelName)
      .forEach(definition => {
        this.models[definition.modelName] = new Model<TRequirements>(
          definition,
          this.createReferenceResolver,
        );
      });
  }

  createReferenceResolver = ({
    defaultModel,
    itemSchema,
    derivedSchemas,
    isNoop = false, // to obtain non-nested schemas for denormalize
  }: TReferenceResolverCreatorConfig = {}) => ({
    modelName = defaultModel,
    schemaName,
  }: TReferenceDeterminant = {}) => {
    if (!modelName || isNoop) {
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
      ? model.resolveSchemaByName(schemaName, false)
      : model.resolveEntitySchema();
  };

  resolveByName(modelName: string): Model<TRequirements> {
    return this.models[modelName];
  }

  requireByName(modelName: string): Model<TRequirements> {
    const model = this.resolveByName(modelName);
    if (!model) {
      throw new Error(`Missing model for "${modelName}"`);
    }
    return model;
  }

  normalize(
    request: TModelRequirements<TRequirements>,
    response: TModelResponse,
  ) {
    const { modelName = '' } = request;
    return this.requireByName(modelName).normalize(request, response);
  }
}
