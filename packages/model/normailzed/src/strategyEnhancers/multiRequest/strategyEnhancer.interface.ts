export interface IRequirements<IRequest> {
  request?: IRequest;
  requests?: IRequest[];
  [key: string]: any;
}

export interface IRequestKeyGetter<IRequest> {
  (request: IRequest): string;
}

export interface IStrategyEnhancerOptions<IRequest> {
  merge?: (request: IRequest, forwardedParams: object) => Object;
  requestKeyGetter?: IRequestKeyGetter<IRequest>;
}

export interface IStrategy<IRequest> {
  (requirements: IRequirements<IRequest>, ...forwardedArgs: any[]): Promise<
    any
  >;
}

export interface IStrategyEnhancer<IRequest> {
  (strategy: IStrategy<IRequest>): IStrategy<IRequest>;
}

export interface IStrategyEnhancerCreator<IRequest> {
  (options: IStrategyEnhancerOptions<IRequest>): IStrategyEnhancer<IRequest>;
}
