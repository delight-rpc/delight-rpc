import { isntFunction, isntUndefined, isError } from '@blackglory/prelude'
import { createResult } from '@utils/create-result.js'
import { createError } from '@utils/create-error.js'
import { tryGetProp, tryGetOwnProp } from 'object-path-operator'
import { assert } from '@blackglory/errors'
import { ParameterValidators, ImplementationOf } from '@src/types.js'
import { IRequest, IResponse, IBatchRequest, IBatchResponse } from '@delight-rpc/protocol'
import { isRequest } from '@utils/is-request.js'
import { isBatchRequest } from '@utils/is-batch-request.js'
import { map } from 'extra-promise'
import { satisfies } from 'semver'
import { createBatchResponse, createErrorForBatchResponse, createResultForBatchResponse } from '@utils/create-batch-response.js'
import { InternalError, MethodNotAvailable, VersionMismatch } from '@src/errors.js'
import { AnyChannel } from './types.js'
import { matchChannel } from '@utils/match-channel.js'

export async function createResponse<API, DataType>(
  api: ImplementationOf<API>
, request: IRequest<DataType> | IBatchRequest<DataType>
, { parameterValidators = {}, version, channel, signal, ownPropsOnly = false }: {
    parameterValidators?: ParameterValidators<API>
    version?: `${number}.${number}.${number}`
    channel?: string | RegExp | typeof AnyChannel
    ownPropsOnly?: boolean
    signal?: AbortSignal
  } = {}
): Promise<null | IResponse<DataType> | IBatchResponse<DataType>> {
  if (!matchChannel(request, channel)) return null

  if (request.expectedVersion && isntUndefined(version)) {
    if (!satisfies(version, request.expectedVersion)) {
      return createError(
        request.id
      , new VersionMismatch(
          `The expected version is "${request.expectedVersion}", but the server version is "${version}".`
        )
      , request.channel
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

        const fn = (ownPropsOnly ? tryGetOwnProp : tryGetProp)(api, request.method)
        if (isntFunction(fn)) {
          return createError(
            request.id
          , new MethodNotAvailable('The method is not available.')
          , request.channel
          )
        }

        signal?.throwIfAborted()
        const result: DataType = await Reflect.apply(
          fn
        , api
        , [...request.params, signal]
        )

        return createResult(request.id, result, request.channel)
      } catch (e) {
        assert(isError(e), 'The thrown object must be an Error')
        return createError(request.id, e, request.channel)
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

          const fn = (ownPropsOnly ? tryGetOwnProp : tryGetProp)(api, request.method)
          if (isntFunction(fn)) {
            return createErrorForBatchResponse(
              new MethodNotAvailable('The method is not available.')
            )
          }

          signal?.throwIfAborted()
          const result: DataType = await Reflect.apply(
            fn
          , api
          , [...request.params, signal]
          )

          return createResultForBatchResponse<DataType>(result)
        } catch (e) {
          assert(isError(e), 'The thrown object must be an Error')
          return createErrorForBatchResponse(e)
        }
      }, concurrency)
      return createBatchResponse(request.id, responses, request.channel)
    } else {
      throw new Error('Unknown request')
    }
  } catch (e) {
    return createError(request.id, new InternalError(`${e}`), request.channel)
  }
}
