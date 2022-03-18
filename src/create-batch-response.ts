import { isntFunction, isError } from '@blackglory/prelude'
import { createError } from '@utils/create-error'
import { tryGetProp } from 'object-path-operator'
import { assert } from '@blackglory/errors'
import { IBatchRequest, IBatchResponse, IError, ParameterValidators, MethodNotAvailable, VersionMismatch, InternalError, ImplementationOf } from '@src/types'
import { isAcceptable } from 'extra-semver'
import { map } from 'extra-promise'
import { createBatchResponse as _createBatchResponse, createErrorForBatchResponse, createResultForBatchResponse } from '@utils/create-batch-response'

export async function createBatchResponse<API extends object, DataType = unknown>(
  api: ImplementationOf<API>
, request: IBatchRequest<DataType>
, parameterValidators: ParameterValidators<API> = {}
, version?: `${number}.${number}.${number}`
): Promise<IError | IBatchResponse<DataType>> {
  if (request.expectedVersion && version) {
    if (!isAcceptable(version, request.expectedVersion)) {
      return createError(
        request.id
      , new VersionMismatch(`The expected version is ^${request.expectedVersion}, but the server version is ${version}.`)
      )
    }
  }

  try {
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
    return _createBatchResponse(request.id, responses)
  } catch (e) {
    return createError(request.id, new InternalError(`${e}`))
  }
}
