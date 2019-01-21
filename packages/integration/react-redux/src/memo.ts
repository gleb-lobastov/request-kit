/* eslint-disable import/prefer-default-export */ // module api expect extension
export const memoizeByLastArgs = (fn: Function) => {
  let initialized = false;
  let lastResult: any;
  let lastArgs: any[];
  return (...args: any[]) => {
    if (
      !initialized ||
      args.length !== lastArgs.length ||
      !args.every((arg, index) => arg === lastArgs[index])
    ) {
      initialized = true;
      lastArgs = args;
      lastResult = fn(...args);
    }
    return lastResult;
  };
};
