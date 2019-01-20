import endpointResolver from './plugins/endpointResolver';

const mergeOptions = (...sources) => {
  const mergedHeaders = Object.assign(
    {},
    ...sources.map(({ headers = {} } = {}) => headers),
  );
  return Object.assign({}, ...sources, { headers: mergedHeaders });
};
const compose = (...fns) => params =>
  fns.reduceRight((composed, fn) => fn(composed), params);
const defaultFetchAdapter = next => ({ endpoint, ...restOptions }) =>
  next(endpoint, restOptions);

class RequestEngine {
  constructor(configuration = {}) {
    this.configuration = configuration;
    const {
      fetchAdapter = defaultFetchAdapter,
      fetchHandler = fetch,
      plugins = [endpointResolver],
    } = this.configuration;
    this.fetchHandler = compose(
      ...plugins,
      fetchAdapter,
    )(fetchHandler);
  }

  preset(presetOptions) {
    const { presetOptions: currentOptions } = this.configuration;
    return new RequestEngine({
      ...this.configuration,
      presetOptions: currentOptions
        ? mergeOptions(currentOptions, presetOptions)
        : presetOptions,
    });
  }

  request(requestOptions) {
    const { presetOptions } = this.configuration;

    return this.fetchHandler(
      presetOptions
        ? mergeOptions(presetOptions, requestOptions)
        : requestOptions,
    );
  }
}

export default configuration => new RequestEngine(configuration);
