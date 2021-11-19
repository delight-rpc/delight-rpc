import { createRequest } from '@utils/create-request'
import { FunctionKeys, KeysExtendType } from 'hotypes'
import { isntString } from '@blackglory/types'

type RequestProxy<Obj, DataType> = {
  [Key in FunctionKeys<Obj> | KeysExtendType<Obj, object>]:
    Obj[Key] extends (...args: infer Args) => unknown
      ? (...args: Args) => IRequest<DataType>
      : RequestProxy<Obj[Key], DataType>
}

class CallableObject extends Function {}

export function createRequestProxy<Obj extends object, DataType = unknown>(
  createId: () => string
): RequestProxy<Obj, DataType> {
  return new Proxy(Object.create(null), {
    get(target, prop) {
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

  function createCallableNestedProxy(
    path: string[]
  ): RequestProxy<Obj, DataType> {
    return new Proxy(new CallableObject(), {
      get(target, prop) {
        if (isntString(prop)) return
        if (['then'].includes(prop)) return
        return createCallableNestedProxy([...path, prop])
      }
    , apply(target, thisArg, args) {
        return createRequest(createId(), path, args)
      }
    , has(target, prop) {
        if (isntString(prop)) return false
        if (['then'].includes(prop)) return false
        return true
      }
    }) as unknown as RequestProxy<Obj, DataType>
  }
}
