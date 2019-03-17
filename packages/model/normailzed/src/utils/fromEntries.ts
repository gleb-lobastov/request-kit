export default (entries: Array<[string, any]>) =>
  entries.reduce(
    (memo, [key, value]) => {
      memo[key] = value;
      return memo;
    },
    {} as { [key: string]: any },
  );
