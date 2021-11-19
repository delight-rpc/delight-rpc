import { nanoid } from 'nanoid'
import { CustomError } from '@blackglory/errors'
import { isntString } from '@blackglory/types'
import { isResult } from '@utils/is-result'
import { FunctionKeys, KeysExtendType } from 'hotypes'
import { createRequest } from '@utils/create-request'
import { IRequest, IResponse } from '@src/types'

export type ClientProxy<Obj> = {
  [Key in FunctionKeys<Obj> | KeysExtendType<Obj, object>]:
    Obj[Key] extends (...args: infer Args) => PromiseLike<infer Result>
      ? (...args: Args) => Promise<Result>
      : (
          Obj[Key] extends (...args: infer Args) => infer Result
            ? (...args: Args) => Promise<Result>
            : ClientProxy<Obj[Key]>
        )
}

class CallableObject extends Function {}

export function createClient<Obj extends object, DataType = unknown>(
  send: (request: IRequest<DataType>) => PromiseLike<IResponse<DataType>>
): ClientProxy<Obj> {
  return new Proxy(Object.create(null), {
    get(target: any, prop: string | symbol) {
      if (isntString(prop)) return
      if (['then'].includes(prop)) return
      return createCallableNestedProxy([prop])
    }
  , has(target, prop) {
      if (isntString(prop)) return false
      if (['then'].includes(prop)) return false
      return true
    }
  })

  function createCallableNestedProxy(path: [string, ...string[]]): ClientProxy<Obj> {
    return new Proxy(new CallableObject(), {
      get(target, prop) {
        if (isntString(prop)) return
        if (['then'].includes(prop)) return
        return createCallableNestedProxy([...path, prop])
      }
    , async apply(target, thisArg, args) {
        const request = createRequest(createId(), path, args)
        const response = await send(request)
        if (isResult(response)) {
          return response.result
        } else {
          if (response.error.type === 'MethodNotAvailable') {
            throw new MethodNotAvailable(response.error.message)
          }
          throw new Error(`${response.error.type}: ${response.error.message}`)
        }
      }
    , has(target, prop) {
        if (isntString(prop)) return false
        if (['then'].includes(prop)) return false
        return true
      }
    }) as unknown as ClientProxy<Obj>
  }
}

export class MethodNotAvailable extends CustomError {}

function createId(): string {
  return nanoid()
}
