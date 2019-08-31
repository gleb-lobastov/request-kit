import ModelsSet from './ModelsSet';
// eslint-disable-next-line no-unused-vars
import { TModelConfig, TModelRequirements, TMiddleware } from './interface';

export default <TRequirements extends {}, TResponse>(
  modelsConfig: TModelConfig,
) => {
  const { modelsDefinitions } = modelsConfig;
  const modelsSet = new ModelsSet<TRequirements>(modelsDefinitions);
  return {
    // this method is responsible for normalization against models config
    modelsNormalizedPlugin: (next: TMiddleware) => (
      requestRequirements: TModelRequirements<TRequirements>,
      ...args: any[]
    ) => {
      const { modelName = '', key = '' } = requestRequirements;
      const model = modelsSet.resolveByName(modelName || key);
      return next(
        {
          ...requestRequirements,
          // todo this makes requirements unserializable, reconsider
          toServerAdapter: model.resolveToServerAdapter(),
          endpoint: model.resolveEndpoint,
        },
        ...args,
      ).then((response: TResponse) =>
        response != null
          ? modelsSet.normalize(requestRequirements, response)
          : null,
      );
    },
    // this method is responsible for querying multiple models at once
    // in request is enough to specify which entities we need (through their modelNames and ids)
    denormalize: (
      requirements: TModelRequirements<TRequirements>,
      result: TResponse,
      entities: any,
    ) => {
      const { modelName = '', key = '' } = requirements;
      return modelsSet
        .resolveByName(modelName || key)
        .denormalize(requirements, result, entities);
    },
  };
};
