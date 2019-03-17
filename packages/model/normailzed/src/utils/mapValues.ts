export default (object: { [key: string]: any }, iteratee: Function) =>
  Object.entries(object)
    .map(([key, value]) => [key, iteratee(value)])
    .reduce(
      (memo, [key, value]) => {
        memo[key] = value;
        return memo;
      },
      {} as { [key: string]: any },
    );
