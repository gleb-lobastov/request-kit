import mapValues from '../../utils/mapValues';
import {
  IStrategyEnhancerOptions,
  IStrategyEnhancer,
} from './strategyEnhancer.interface';
const REQUEST_DEFAULT_KEY = 'response';

const defaultMerge = (...sources: Object[]) => Object.assign({}, ...sources);

const strategyEnhancerCreator = <IRequest extends {}>({
  merge = defaultMerge,
  requestKeyGetter = () => REQUEST_DEFAULT_KEY,
}: IStrategyEnhancerOptions<IRequest> = {}): IStrategyEnhancer<
  IRequest
> => strategy => (requirements, ...forwardedArgs) => {
  const { request, requests, ...forwardedParams } = requirements;
  if (request) {
    const key = requestKeyGetter(request);
    return Promise.resolve({
      [key]: strategy(merge(request, forwardedParams), ...forwardedArgs),
    });
  }
  if (requests) {
    return Promise.resolve(
      mapValues(requests, (request: IRequest) =>
        strategy(merge(request, forwardedParams), ...forwardedArgs),
      ),
    );
  }
  return Promise.resolve();
};

export default strategyEnhancerCreator;
