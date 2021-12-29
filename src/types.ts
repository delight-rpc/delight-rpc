import { FunctionKeys, KeysExtendType } from 'hotypes'

/**
 * The reason why it is divided into two fields
 * is to make it easier to distinguish
 * when sharing channels with other protocols.
 * 
 * Reducing the size of payloads is not the goal of Delight RPC.
 */
interface IBase {
  protocol: 'delight-rpc'
  version: '1.0'
}

export interface IRequest<T> extends IBase {
  id: string
  
  /**
   * The `method` field can include the namespace it belongs to.
   * For example, `['config','save']` represents the `save` method
   * under the namespace `config`.
   */
  method: string[]
  params: T[]
}

export type IResponse<T> = IResult<T> | IError

export interface IResult<T> extends IBase {
  id: string
  result: T
}

export interface IError extends IBase {
  id: string
  error: {
    /**
     * The type the error belongs to
     */
    type: string

    /**
     * Human-readable error message.
     */
    message: string
  }
}

export type ParameterValidators<Obj> = Partial<{
  [Key in FunctionKeys<Obj> | KeysExtendType<Obj, object>]:
    Obj[Key] extends (...args: infer Args) => void
      ? (...args: Args) => void
      : ParameterValidators<Obj[Key]>
}>
