export default next => ({ format, ...restOptions }) =>
  next(restOptions).then(response => response.json());
