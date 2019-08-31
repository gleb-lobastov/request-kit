import {
  selectPlaceholder,
  selectResult,
  selectError,
  selectIsReady,
  selectIsPending,
  selectIsValid,
} from '@request-kit/controller-redux';

export const mapValues = (object, iteratee) =>
  Object.entries(object).reduce((memo, [key, value]) => {
    memo[key] = iteratee(value, key, object);
    return memo;
  }, {});

export default (
  provisionStateMapping = {},
  checkShouldMergeDomain = () => true,
) => {
  const values = Object.entries(provisionStateMapping).reduce(
    (memo, [domain, value]) => {
      if (checkShouldMergeDomain(domain)) {
        memo.push(value);
      }
      return memo;
    },
    [],
  );
  const fallback = mapValues(provisionStateMapping, selectPlaceholder);
  return {
    isComplete: values.every(selectIsReady),
    isPending: values.some(selectIsPending),
    isValid: values.every(selectIsValid),
    validStateMapping: mapValues(provisionStateMapping, selectIsValid),
    error: values.find(selectError),
    errors: values.map(selectError).filter(Boolean),
    hasFallback: Object.values(fallback).every(Boolean),
    fallback,
    value: mapValues(provisionStateMapping, selectResult),
  };
};
