import { isntFunction, isError } from '@blackglory/prelude'
import { createResult } from '@utils/create-result'
import { createError } from '@utils/create-error'
import { tryGetProp } from 'object-path-operator'
import { assert } from '@blackglory/errors'
import { IRequest, IResponse, ParameterValidators, MethodNotAvailable, VersionMismatch, InternalError, ImplementationOf } from '@src/types'
import { isAcceptable } from 'extra-semver'
import { createBatchResponse as _createBatchResponse } from '@utils/create-batch-response'

export async function createResponse<API extends object, DataType = unknown>(
  api: ImplementationOf<API>
, request: IRequest<DataType>
, parameterValidators: ParameterValidators<API> = {}
, version?: `${number}.${number}.${number}`
): Promise<IResponse<DataType>> {
  if (request.expectedVersion && version) {
    if (!isAcceptable(version, request.expectedVersion)) {
      return createError(
        request.id
      , new VersionMismatch(`The expected version is ^${request.expectedVersion}, but the server version is ${version}.`)
      )
    }
  }

  try {
    try {
      const validate = tryGetProp(
        parameterValidators
      , request.method
      ) as ((...args: unknown[]) => void) | undefined
      validate?.(...request.params)

      const fn = tryGetProp(api, request.method)
      if (isntFunction(fn)) {
        return createError(request.id, new MethodNotAvailable('The method is not available.'))
      }

      const result = await Reflect.apply(fn, api, request.params)
      return createResult(request.id, result)
    } catch (e) {
      assert(isError(e), 'The thrown object must be an Error')
      return createError(request.id, e)
    }
  } catch (e) {
    return createError(request.id, new InternalError(`${e}`))
  }
}
