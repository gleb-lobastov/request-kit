export default next => ({ endpoint, ...restOptions }) =>
  next({
    endpoint: typeof endpoint === 'string' ? endpoint : endpoint(restOptions),
    ...restOptions,
  });
