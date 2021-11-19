import { isntFunction, isError } from '@blackglory/types'
import { createResult } from '@utils/create-result'
import { createError } from '@utils/create-error'
import { tryGetProp } from 'object-path-operator'
import { assert } from '@blackglory/errors'

export async function applyRequest<DataType>(
  api: object
, request: IRequest<DataType>
): Promise<IResponse<DataType>> {
  try {
    const fn = tryGetProp(api, request.method)
    if (isntFunction(fn)) {
      return createError(
        request.id
      , 'MethodNotAvailable'
      , 'The method is not available.'
      )
    }

    try {
      const result = await Reflect.apply(fn, api, request.params)
      return createResult(request.id, result)
    } catch (e) {
      assert(isError(e), 'The thrown object must be an Error')
      return createError(request.id, e.name, e.message)
    }
  } catch (e) {
    return createError(request.id, 'InternalError', `${e}`)
  }
}
