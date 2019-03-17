import { IModelRequest } from './Model';
import ModelsSet, { IModelsConfig } from './ModelsSet';
import multiRequestStrategyEnhancerCreator from './strategyEnhancers/multiRequest';
import { IRequestHandler, ICustomRequest } from './interface';

// workaround for https://github.com/babel/babel/issues/8361
export interface IModelsConfig extends IModelsConfig {}

export default (modelsConfig: IModelsConfig) => {
  const modelsSet = new ModelsSet(modelsConfig);
  return {
    // this method is responsible for normalization against models config
    requestEnhancer: (requestHandler: IRequestHandler) => (
      request: IModelRequest,
      ...args: any[]
    ) =>
      requestHandler(request, ...args).then(response =>
        response != null ? modelsSet.normalize(request, response) : null,
      ),

    // this method is responsible for querying multiple models at once
    // in request is enough to specify which entities we need (through their modelNames and ids)
    strategyEnhancer: multiRequestStrategyEnhancerCreator<IModelRequest>({
      requestKeyGetter: ({ modelName }) => modelName,
      merge: (
        { query, modelName, ...forwardingParams }: IModelRequest,
        sharedRequestParams: ICustomRequest,
      ) => {
        const model = modelsSet.resolveByName(modelName);
        if (!model) {
          throw new Error(`Model "${modelName} not defined`);
        }
        return {
          ...sharedRequestParams,
          ...forwardingParams,
          query,
          modelName,
          endpoint: model.resolveEndpoint,
        };
      },
    }),
  };
};

/*
const { models, middleware, provide, reducer } = createRequestKit({
  requestConfig: {
    presetOptions: {},
    plugins: [],
  },
  modelsDefinitions: {
    travelers: {},
    visits: {},
    cities: {},
  },
});

/*
const PAGE_DOMAIN = 'CitiesPage';
const CITIES_KEY = 'cities';
provide((state, { match: { params: { strTravelerId, strCountryId } } }) => ({
meta: {
  domain: 'CitiesPage',
  }
  requests: {
    traveler: {
      modelKey: travelers.modelKey,
      query: {
        id: { id: parseInt(strTravelerId, 10) },
      },
    },
    [CITIES_KEY]: {
      modelKey: cities.modelKey,
      query: {
        filter: {
          countryId: parseInt(strCountryId, 10),
        },
        navigation: false,
      },
    },
    visits: {
      modelKey: visits.modelKey,
      query: {
        filter: {
          citiesIds: cities.selectMissingIds({
            requiredIds: selectProvision(
              state,
              `${PAGE_DOMAIN}.${CITIES_KEY}`,
            ),
          }),
        },
        navigation: false,
      },
    },
  },
}));
*/
