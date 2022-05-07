import { FunctionKeys, KeysExtendType } from 'hotypes'
import { IRequest, IResponse, IBatchRequest, IBatchResponse } from '@delight-rpc/protocol'

export type ImplementationOf<Obj> = {
  [Key in FunctionKeys<Obj> | KeysExtendType<Obj, object>]:
    Obj[Key] extends (...args: infer Args) => infer Result
      ? (...args: Args) => PromiseLike<Awaited<Result>> | Awaited<Result>
      : ImplementationOf<Obj[Key]>
}

export type ParameterValidators<Obj> = Partial<{
  [Key in FunctionKeys<Obj> | KeysExtendType<Obj, object>]:
    Obj[Key] extends (...args: infer Args) => unknown
      ? (...args: Args) => void
      : ParameterValidators<Obj[Key]>
}>

export interface IClientAdapter<T> {
  send(request: IRequest<T> | IBatchRequest<T>): Promise<void>
  listen(listener: (response: IResponse<T> | IBatchResponse<T>) => void): () => void
}

export interface IServerAdapter<T> {
  send(response: IResponse<T> | IBatchResponse<T>): Promise<void>
  listen(listener: (request: IRequest<T> | IBatchRequest<T>) => void): () => void
}
