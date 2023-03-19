import { IRequest, IResponse } from '@delight-rpc/protocol'
import { hydrate } from '@blackglory/errors'
import { go, pass, isntString } from '@blackglory/prelude'
import { isResult } from '@utils/is-result.js'
import { isError } from '@utils/is-error.js'
import { FunctionKeys, KeysByType } from 'hotypes'
import { createRequest } from '@utils/create-request.js'
import { ParameterValidators } from '@src/types.js'
import { tryGetProp } from 'object-path-operator'
import { createUUID } from '@utils/create-uuid.js'

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
    expectedVersion?: string
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
    return new Proxy(pass, {
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
