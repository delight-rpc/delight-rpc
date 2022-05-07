import { isntFunction, isError } from '@blackglory/prelude'
import { createResult } from '@utils/create-result'
import { createError } from '@utils/create-error'
import { tryGetProp } from 'object-path-operator'
import { assert } from '@blackglory/errors'
import {
  IServerAdapter
, IRequest
, IResponse
, IBatchRequest
, IBatchResponse
, ParameterValidators
, MethodNotAvailable
, VersionMismatch
, InternalError
, ImplementationOf
} from '@src/types'
import { isAcceptable } from 'extra-semver'
import { isRequest } from '@utils/is-request'
import { isBatchRequest } from '@utils/is-batch-request'
import { map } from 'extra-promise'
import { createBatchResponse, createErrorForBatchResponse, createResultForBatchResponse } from '@utils/create-batch-response'

export function createServer<API extends object, DataType = unknown>(
  api: ImplementationOf<API>
, adapter: IServerAdapter<DataType>
, { parameterValidators = {}, version, channel }: {
    parameterValidators?: ParameterValidators<API>
    version?: `${number}.${number}.${number}`
    channel?: string
  } = {}
): () => void {
  const closeRequestsHandler = handleRequests()
  return () => closeRequestsHandler()

  function handleRequests(): () => void {
    return adapter.listen(async request => {
      if (channel !== request.channel) return

      adapter.send(await createResponse(request))
    })
  }

  async function createResponse(
    request: IRequest<DataType> | IBatchRequest<DataType>
  ): Promise<IResponse<DataType> | IBatchResponse<DataType>> {
    if (request.expectedVersion && version) {
      if (!isAcceptable(version, request.expectedVersion)) {
        return createError(
          request.id
        , new VersionMismatch(
            `The expected version is ^${request.expectedVersion}, but the server version is ${version}.`
          )
        , channel
        )
      }
    }

    try {
      if (isRequest(request)) {
        try {
          const validate = tryGetProp(
            parameterValidators
          , request.method
          ) as ((...args: unknown[]) => void) | undefined
          validate?.(...request.params)

          const fn = tryGetProp(api, request.method)
          if (isntFunction(fn)) {
            return createError(
              request.id
            , new MethodNotAvailable('The method is not available.')
            , channel
            )
          }

          const result = await Reflect.apply(fn, api, request.params)
          return createResult(request.id, result, channel)
        } catch (e) {
          assert(isError(e), 'The thrown object must be an Error')
          return createError(request.id, e, channel)
        }
      } else if (isBatchRequest(request)) {
        const concurrency = request.parallel ? Infinity : 1
        const responses = await map(request.requests, async request => {
          try {
            const validate = tryGetProp(
              parameterValidators
            , request.method
            ) as ((...args: unknown[]) => void) | undefined
            validate?.(...request.params)

            const fn = tryGetProp(api, request.method)
            if (isntFunction(fn)) {
              return createErrorForBatchResponse(new MethodNotAvailable('The method is not available.'))
            }

            const result = await Reflect.apply(fn, api, request.params)
            return createResultForBatchResponse<DataType>(result)
          } catch (e) {
            assert(isError(e), 'The thrown object must be an Error')
            return createErrorForBatchResponse(e)
          }
        }, concurrency)
        return createBatchResponse(request.id, responses, channel)
      } else {
        throw new Error('Unknown request')
      }
    } catch (e) {
      return createError(request.id, new InternalError(`${e}`), channel)
    }
  }
}
