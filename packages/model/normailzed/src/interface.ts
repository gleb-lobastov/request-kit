import { IModelRequest, IModelResponsePromise } from './Model';

export interface IRequestHandler {
  (request: IModelRequest, ...args: any[]): IModelResponsePromise;
}

export interface ICustomRequest {}
