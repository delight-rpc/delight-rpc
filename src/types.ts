import { FunctionKeys, KeysExtendType } from 'hotypes'
import { Nullable } from '@blackglory/prelude'
import { SerializableError, CustomError } from '@blackglory/errors'

export type ImplementationOf<Obj> = {
  [Key in FunctionKeys<Obj> | KeysExtendType<Obj, object>]:
    Obj[Key] extends (...args: infer Args) => infer Result
      ? (...args: Args) => PromiseLike<Awaited<Result>> | Awaited<Result>
      : ImplementationOf<Obj[Key]>
}

/**
 * The reason why it is divided into two fields
 * is to make it easier to distinguish
 * when sharing channels with other protocols.
 * 
 * Reducing the size of payloads is not the goal of Delight RPC.
 */
export interface IDelightRPC {
  protocol: 'delight-rpc'
  version: `2.${number}`

  [key: string]: unknown
}

export interface IRequest<T> extends IDelightRPC {
  id: string

  /**
   * The expected server version, based on semver.
   */
  expectedVersion?: Nullable<`${number}.${number}.${number}`>
  
  /**
   * The `method` field can include the namespace it belongs to.
   * For example, `['config','save']` represents the `save` method
   * under the namespace `config`.
   */
  method: string[]
  params: T[]
}

export type IResponse<T> = IResult<T> | IError

export interface IResult<T> extends IDelightRPC {
  id: string
  result: T
}

export interface IError extends IDelightRPC {
  id: string
  error: SerializableError
}

export interface IBatchRequest<T> extends IDelightRPC {
  id: string

  /**
   * The expected server version, based on semver.
   */
  expectedVersion?: Nullable<`${number}.${number}.${number}`>

  parallel: boolean

  requests: Array<IRequestForBatchRequest<unknown, T>>
}

export interface IBatchResponse<DataType> extends IDelightRPC {
  id: string
  responses: Array<
  | IResultForBatchResponse<DataType>
  | IErrorForBatchResponse
  >
}

export type ParameterValidators<Obj> = Partial<{
  [Key in FunctionKeys<Obj> | KeysExtendType<Obj, object>]:
    Obj[Key] extends (...args: infer Args) => unknown
      ? (...args: Args) => void
      : ParameterValidators<Obj[Key]>
}>

export class MethodNotAvailable extends CustomError {}
export class VersionMismatch extends CustomError {}
export class InternalError extends CustomError {}

export interface IRequestForBatchRequest<Result, DataType> {
  method: string[]
  params: DataType[]
}

export interface IResultForBatchResponse<T> {
  result: T
}

export interface IErrorForBatchResponse {
  error: SerializableError 
}
