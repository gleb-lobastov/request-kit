export type IDomainPath = string;
export type IDomainFilterRegexp = string;

export interface IDomainFilter {
  (domainPath: IDomainPath): boolean;
}

export interface IDistributeReducerOptions {
  maxNestingDepth?: number;
  domainsFilter?: IDomainFilterRegexp;
}

export interface IActionMeta {
  domain?: IDomainPath;
  distributeReducerOptions?: IDistributeReducerOptions;
}

export interface IAction {
  meta?: IActionMeta;
}
export interface IReducer<IState> {
  (state: IState | undefined, action: IAction): IState;
}

export interface IDomainCompositeState<IDomainState> {
  domains: { [key: string]: IDomainCompositeState<IDomainState> | undefined };
  domainState?: IDomainState;
}

export interface IStepParams<IDomainState> {
  domainCompositeState: IDomainCompositeState<IDomainState> | undefined;
  domainPath: IDomainPath;
  depth: number;
}

export interface IDomainStatesMapping<IDomainState> {
  [key: string]: IDomainState;
}

export interface ISelectorOptions<IEmptyState> {
  emptyState?: IEmptyState | {};
  domainsFilter?: IDomainFilterRegexp;
}

export interface IAdaptedSelectorOptions<IEmptyState> {
  emptyState?: IEmptyState | {};
  domainsFilter?: IDomainFilter;
}
