export default next => ({ endpoint, ...restOptions }) =>
  next(endpoint, restOptions);
