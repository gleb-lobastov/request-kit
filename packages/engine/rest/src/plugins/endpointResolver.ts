interface EndpointResolverOptions {
  endpoint: string | (({}) => string);
}

export default (next: Function) => ({
  endpoint,
  ...restOptions
}: EndpointResolverOptions) =>
  next({
    endpoint: typeof endpoint === 'string' ? endpoint : endpoint(restOptions),
    ...restOptions,
  });
