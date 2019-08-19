import { IDomainFilterRegexp, IDomainFilter, IDomainPath } from './interface';

export const PATH_PARTITIONS_SEPARATOR = '.';

export const mapValues = <T, P>(
  object: { [key: string]: T },
  iteratee: (value: T, key: string, object: { [key: string]: T }) => P,
) =>
  Object.entries(object).reduce((memo: { [key: string]: P }, [key, value]) => {
    memo[key] = iteratee(value, key, object);
    return memo;
  }, {});

export const isShallowEqual = (
  objA: { [key: string]: any },
  objB: { [key: string]: any },
): boolean => {
  const keysA = Object.keys(objA);
  const keysB = Object.keys(objB);
  if (keysA.length !== keysB.length) {
    return false;
  }
  return keysA.every(key => Object.is(objA[key], objB[key]));
};

export const domainsFilterAdapter = (
  domainsFilter?: IDomainFilterRegexp,
): IDomainFilter => {
  if (!domainsFilter) {
    return () => true;
  }
  const re = new RegExp(domainsFilter);
  return re.test.bind(re);
};

export const resolveDomainPathPartitions = (
  domainPath: IDomainPath = '',
): Array<string> => domainPath.split(PATH_PARTITIONS_SEPARATOR).filter(Boolean);

export const resolveNestedPath = (
  basePath: IDomainPath,
  pathPartition: string,
) => {
  if (!basePath) {
    return pathPartition;
  }
  return `${basePath}${PATH_PARTITIONS_SEPARATOR}${pathPartition}`;
};
