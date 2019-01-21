export interface Options {
  headers?: object;
}

type Result = object;
type Processor = (options: Options, ...args: any[]) => Promise<Result>;

export interface FetchHandler {
  (...args: any[]): Promise<Result>;
}
export interface Plugin {
  (next: Plugin | FetchHandler): Processor;
}
export interface EngineConfiguration {
  fetchHandler?: FetchHandler;
  fetchAdapter?: Plugin;
  plugins?: Plugin[];
  presetOptions?: Options;
}

const compose = (...fns: Function[]) => (params: any) =>
  fns.reduceRight((composed, fn) => fn(composed), params);

const mergeOptions = (...sources: Options[]) => {
  const mergedHeaders = Object.assign(
    {},
    ...sources.map(({ headers = {} } = {}) => headers),
  );
  return Object.assign({}, ...sources, { headers: mergedHeaders });
};

const defaultFetchAdapter = (next: FetchHandler) => ({
  endpoint,
  ...restOptions
}: {
  endpoint: string;
}) => next(endpoint, restOptions);

class RequestEngine {
  configuration: EngineConfiguration;
  requestHandler: FetchHandler;

  constructor(configuration: EngineConfiguration = {}) {
    this.configuration = configuration;
    const {
      fetchHandler = fetch,
      fetchAdapter,
      plugins = [],
    } = this.configuration;
    const actualFetchAdapter =
      !fetchAdapter && fetchHandler === fetch ? defaultFetchAdapter : null;
    const actualPlugins = actualFetchAdapter
      ? [...plugins, actualFetchAdapter]
      : plugins;
    this.requestHandler = compose(...actualPlugins)(fetchHandler);
  }

  preset(presetOptions: Options) {
    const { presetOptions: currentOptions } = this.configuration;
    return new RequestEngine({
      ...this.configuration,
      presetOptions: currentOptions
        ? mergeOptions(currentOptions, presetOptions)
        : presetOptions,
    });
  }

  request(requestOptions: Options) {
    const { presetOptions } = this.configuration;

    return this.requestHandler(
      presetOptions
        ? mergeOptions(presetOptions, requestOptions)
        : requestOptions,
    );
  }
}

export default (configuration: EngineConfiguration) =>
  new RequestEngine(configuration);
