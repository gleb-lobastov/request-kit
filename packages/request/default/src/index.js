import endpointAdapter from './middleware/endpointAdapter';
import responseAsJson from './middleware/responseAsJson';
import fetchAdapter from './middleware/fetchAdapter';

const compose = (...fns) => params =>
  fns.reduceRight((composed, fn) => fn(composed), params);

const globalFetch =
  typeof fetch === 'undefined'
    ? () => {
        throw new Error(
          'Fetch handler is not defined, make sure that "fetch" handler is available as global variable, or provide custom handler through "requestHandler" option',
        );
      }
    : fetch;

export default ({
  requestHandler = globalFetch,
  middleware = [endpointAdapter, responseAsJson, fetchAdapter],
}) => {
  const actualRequestHandler = compose(...middleware)(requestHandler);
  return (...args) => actualRequestHandler(...args);
};
