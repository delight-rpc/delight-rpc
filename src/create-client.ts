import { assert, hydrate } from '@blackglory/errors'
import { isntString } from '@blackglory/prelude'
import { isResult } from '@utils/is-result'
import { isError } from '@utils/is-error'
import { FunctionKeys, KeysExtendType } from 'hotypes'
import { createRequest } from '@utils/create-request'
import { IClientAdapter, ParameterValidators } from '@src/types'
import { tryGetProp } from 'object-path-operator'
import { createUUID } from '@utils/create-uuid'
import { CallableObject } from '@utils/callable-object'
import { Deferred } from 'extra-promise'

export type ClientProxy<Obj> = {
  [Key in FunctionKeys<Obj> | KeysExtendType<Obj, object>]:
    Obj[Key] extends (...args: infer Args) => infer Result
      ? (...args: Args) => Promise<Awaited<Result>>
      : ClientProxy<Obj[Key]>
}

export function createClient<API extends object, DataType = unknown>(
  adapter: IClientAdapter<DataType> 
, { parameterValidators = {}, expectedVersion, channel }: {
    parameterValidators?: ParameterValidators<API>
    expectedVersion?: `${number}.${number}.${number}`
    channel?: string
  } = {}
): [client: ClientProxy<API>, close: () => void] {
  const pendings = new Map<string, Deferred<DataType>>()
  const removeResponsesHandler = handleResponses()
  const client = new Proxy(Object.create(null), {
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

  return [
    client
  , () => {
      removeResponsesHandler()
      pendings.clear()
    }
  ]

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

        return handleRequest(path, args)
      }
    , has(target, prop) {
        if (isntString(prop)) return false
        if (['then'].includes(prop)) return false
        return true
      }
    }) as unknown as ClientProxy<API>
  }

  async function handleRequest(path: string[], params: any[]): Promise<DataType> {
    const request = createRequest(
      createUUID()
    , path
    , params
    , expectedVersion
    , channel
    )

    assert(!pendings.has(request.id), 'request id duplicated')
    const deferred = new Deferred<DataType>()
    pendings.set(request.id, deferred)

    await adapter.send(request)
    return await deferred
  }

  function handleResponses(): () => void {
    return adapter.listen(response => {
      if (channel !== response.channel) return

      try {
        const deferred = pendings.get(response.id)
        if (deferred) {
          if (isResult(response)) {
            deferred.resolve(response.result)
          } else if (isError(response)) {
            deferred.reject(hydrate(response.error))
          }
        }
      } finally {
        pendings.delete(response.id)
      }
    })
  }
}
