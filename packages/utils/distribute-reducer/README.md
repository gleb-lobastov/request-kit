### About

**distributeReducerByDomain** is wrapper to apply over your redux reducer.

When applied it turns passed state into hierarchy of nested states. Every state is accessible by path, called here "domain". Wrapped reducer will be applied only to state of domain specified in action.

Domain used to select either particular state or array of all states in hierarchy

Domain is represented as string with "." delimiters.
Each part is domain name in appropriate level of domains hierarchy.

"Libraries.Redux" domain is nested in "Libraries" domain. If select all states of "Libraries" domain "Libraries.Redux" will be in list.

### Example use case

_or original purpose of this module_

Manage related server requests. Utility give handy access to states of all requests on current page by domain "%page%". This is convenient to show errors and loading indicators. Moreover requests could be divided as "fetch" and "submit", or "%component%" or "%actionType%", etc.

### API

```ecmascript 6
const {
  /* Provided API */
  reducer,
  selectDomainState,
  selectDomainStates,
} = distributeReducerByDomain({
  /* Configuration */
  domainSeparator,
  domainProperty,
  onError,
  reducer, // only required
});
```

#### Provided API

1.  **reducer(state, action) => state** – wrapped reducer
1.  **selectDomainState(state, domain) => domainState** – select only state of specified domain. No nested states included
1.  **selectDomainStates(state, domain) => [...domainStates]** – select array, consist of specified domain state and all it nested (recursively) domains state

#### Configuration

1.  **domainSeparator** – sign used to separate nested domain names in path. Default to '.'
1.  **domainProperty** – specify domain path property in redux action. Could be string (dot-separated path) or function, that receives action. Default to 'meta.domain'
1.  **onError** – custom known error handler, default to just throw new Error
1.  **reducer** – wrapped reducer. Required!
