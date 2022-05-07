import { isntFunction, isntUndefined, isError } from '@blackglory/prelude'
import { createResult } from '@utils/create-result'
import { createError } from '@utils/create-error'
import { tryGetProp } from 'object-path-operator'
import { assert } from '@blackglory/errors'
import { ParameterValidators, ImplementationOf } from '@src/types'
import { IRequest, IResponse, IBatchRequest, IBatchResponse } from '@delight-rpc/protocol'
import { isAcceptable } from 'extra-semver'
import { isRequest } from '@utils/is-request'
import { isBatchRequest } from '@utils/is-batch-request'
import { map } from 'extra-promise'
import { createBatchResponse, createErrorForBatchResponse, createResultForBatchResponse } from '@utils/create-batch-response'
import { InternalError, MethodNotAvailable, VersionMismatch } from '@src/errors'

export async function createResponse<API, DataType>(
  api: ImplementationOf<API>
, request: IRequest<DataType> | IBatchRequest<DataType>
, { parameterValidators = {}, version, channel }: {
    parameterValidators?: ParameterValidators<API>
    version?: `${number}.${number}.${number}`
    channel?: string
  } = {}
): Promise<null | IResponse<DataType> | IBatchResponse<DataType>> {
  if (request.channel !== channel) return null
  if (request.expectedVersion && isntUndefined(version)) {
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
