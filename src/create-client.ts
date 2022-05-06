import { hydrate } from '@blackglory/errors'
import { go, isntString } from '@blackglory/prelude'
import { isResult } from '@utils/is-result'
import { FunctionKeys, KeysExtendType } from 'hotypes'
import { createRequest } from '@utils/create-request'
import { IRequest, IResponse, ParameterValidators } from '@src/types'
import { tryGetProp } from 'object-path-operator'
import { createUUID } from '@utils/create-uuid'
import { CallableObject } from '@utils/callable-object'

export type ClientProxy<Obj> = {
  [Key in FunctionKeys<Obj> | KeysExtendType<Obj, object>]:
    Obj[Key] extends (...args: infer Args) => infer Result
      ? (...args: Args) => Promise<Awaited<Result>>
      : ClientProxy<Obj[Key]>
}

export function createClient<API extends object, DataType = unknown>(
  send: (request: IRequest<DataType>) => PromiseLike<IResponse<DataType>>
, parameterValidators: ParameterValidators<API> = {}
, expectedVersion?: `${number}.${number}.${number}`
, channel?: string
): ClientProxy<API> {
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

  function createCallableNestedProxy(path: [string, ...string[]]): ClientProxy<API> {
    return new Proxy(new CallableObject(), {
      get(target, prop) {
        if (isntString(prop)) return
        if (['then'].includes(prop)) return
        return createCallableNestedProxy([...path, prop])
      }
    , apply(target, thisArg, args) {
        const validate = tryGetProp(
          parameterValidators
        , path
        ) as ((...args: unknown[]) => void) | undefined
        validate?.(...args)

        return go(async () => {
          const request = createRequest(
            createUUID()
          , path
          , args
          , expectedVersion
          , channel
          )
          const response = await send(request)
          if (isResult(response)) {
            return response.result
          } else {
            throw hydrate(response.error)
          }
        })
      }
    , has(target, prop) {
        if (isntString(prop)) return false
        if (['then'].includes(prop)) return false
        return true
      }
    }) as unknown as ClientProxy<API>
  }
}
