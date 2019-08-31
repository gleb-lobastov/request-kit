import observeIsChanged from './observeIsChanged';
import mergeProvisionState, { mapValues } from './mergeProvisionState';

const DEFAULT_DOMAIN = '__unassigned';

const checkIsNoop = requirements => {
  const { isChanged, condition = true } = requirements;
  return Boolean(!condition || !isChanged);
};

export const multipleRequestMap = (requirements, callback) => {
  const { request } = requirements;

  const mapping = Object.keys(request || {}).reduce((memo, key) => {
    const value = callback(request[key], key, requirements);
    if (value !== undefined) {
      memo[key] = value;
    }
    return memo;
  }, {});

  return { ...requirements, request: mapping };
};

const resolveSpecificRequirements = (
  {
    domain = DEFAULT_DOMAIN,
    request,
    comparisonResult = {},
    ...sharedRequirements
  },
  key,
) => {
  const specificRequirements = request[key];
  return {
    ...sharedRequirements,
    isChanged: comparisonResult[key],
    modelName: key,
    key,
    ...specificRequirements,
    domain: `${domain}.${key}`,
  };
};

export const multipleRequestEnhancer = strategy => (
  requirements,
  ...forwardedArgs
) => {
  const { isProvision, request } = requirements; // todo consider split for submits
  if (!isProvision || !request) {
    return strategy(requirements, ...forwardedArgs);
  }

  const requests = mapValues(
    Object.keys(request || {}).reduce((memo, key) => {
      const specificRequirements = resolveSpecificRequirements(
        requirements,
        key,
      );
      if (!checkIsNoop(specificRequirements)) {
        memo[key] = specificRequirements;
      }
      return memo;
    }, {}),
    specificRequirements => strategy(specificRequirements, ...forwardedArgs),
  );

  const requestsEntries = Object.entries(requests);
  return Promise.all(requestsEntries).then(responses =>
    responses.reduce((memo, response, index) => {
      const [key] = requestsEntries[index];
      memo[key] = response;
      return memo;
    }, {}),
  );
};

export const multipleProvisionSelector = (
  provisionState,
  requirements,
  particularSelector,
) => {
  const { domain = DEFAULT_DOMAIN, request = {} } = requirements || {};

  return mergeProvisionState(
    Object.keys(request).reduce((memo, key) => {
      const particularProvision = particularSelector(
        provisionState,
        `${domain}.${key}`,
      );

      // Ignore particular requirements, which was never requested and not missing.
      // Difference is in isComplete flag. If some data is required, but never
      // requested, then provision can not be marked as complete. As not all
      // required data is provided. But if some requirement is flagged as
      // not missing (not required), then lack of this data should not mark
      // provision as incomplete. Because, this request could even never be called.
      if (
        particularProvision ||
        !checkIsNoop(resolveSpecificRequirements(requirements, key))
      ) {
        memo[key] = particularProvision;
      }
      return memo;
    }, {}),
  );
};

export const multipleProvisionAdapter = ({
  originalAdapter,
  provisionValues,
  requirements,
  state, // todo use ...forwardingProps
}) =>
  mapValues(provisionValues || {}, (result, key) =>
    originalAdapter(
      state,
      resolveSpecificRequirements(requirements, key),
      result,
    ),
  );

const checkIsInvalidated = (prevProvision, nextProvision, key) => {
  if (!prevProvision) {
    return false;
  }
  const { validStateMapping: prevValidStateMapping = {} } = prevProvision || {};
  const { validStateMapping: nextValidStateMapping = {} } = nextProvision || {};
  return prevValidStateMapping[key] && !nextValidStateMapping[key];
};

export const multipleCheckIsRequirementsChanged = (
  { requirements: prevRequirements, provision: prevProvision },
  { requirements: nextRequirements, provision: nextProvision },
) => {
  const hasPrevRequirements = Boolean(prevRequirements);
  const { request: prevRequest = {} } = prevRequirements || {};
  const { request: nextRequest = {} } = nextRequirements || {};
  return mapValues(nextRequest, (nextSpecificRequirements, key) => {
    const prevSpecificRequirements = hasPrevRequirements
      ? prevRequest[key] || {}
      : undefined;
    return (
      checkIsInvalidated(prevProvision, nextProvision, key) ||
      observeIsChanged(prevSpecificRequirements, nextSpecificRequirements)
    );
  });
};
