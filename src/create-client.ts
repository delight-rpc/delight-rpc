import { IRequest, IResponse } from '@delight-rpc/protocol'
import { hydrate } from '@blackglory/errors'
import { go, isntString } from '@blackglory/prelude'
import { isResult } from '@utils/is-result'
import { isError } from '@utils/is-error'
import { FunctionKeys, KeysByType } from 'hotypes'
import { createRequest } from '@utils/create-request'
import { ParameterValidators } from '@src/types'
import { tryGetProp } from 'object-path-operator'
import { createUUID } from '@utils/create-uuid'
import { CallableObject } from '@utils/callable-object'

export type ClientProxy<Obj> = {
  [Key in FunctionKeys<Obj> | KeysByType<Obj, object>]:
    Obj[Key] extends (...args: infer Args) => infer Result
      ? (...args: Args) => Promise<Awaited<Result>>
      : ClientProxy<Obj[Key]>
}

export function createClient<API extends object, DataType = unknown>(
  send: (request: IRequest<DataType>) => PromiseLike<IResponse<DataType>>
, { parameterValidators = {}, expectedVersion, channel }: {
    parameterValidators?: ParameterValidators<API>
    expectedVersion?: `${number}.${number}.${number}`
    channel?: string
  } = {}
): ClientProxy<API> {
  return new Proxy(Object.create(null), {
    get(target: any, prop: string | symbol) {
      if (isntString(prop)) return
      if (['then', 'toJSON'].includes(prop)) return
      return createCallableNestedProxy([prop])
    }
  , has(target, prop) {
      if (isntString(prop)) return false
      if (['then', 'toJSON'].includes(prop)) return false
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

          if (isResult(response)) return response.result
          if (isError(response)) throw hydrate(response.error)
          throw new Error('Invalid response')
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
