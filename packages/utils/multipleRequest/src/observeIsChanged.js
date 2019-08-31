import isEqual from 'lodash/isEqual';

export default (prevRequirements, nextRequirements) => {
  const { observe: prevObservable } = prevRequirements || {};
  const { observe: nextObservable } = nextRequirements || {};

  if (!prevRequirements && nextObservable === undefined) {
    return true;
  }
  return !isEqual(prevObservable, nextObservable);
};
