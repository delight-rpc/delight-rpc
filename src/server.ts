import { isntFunction, isError } from '@blackglory/types'
import { createResult } from '@utils/create-result'
import { createError } from '@utils/create-error'
import { tryGetProp } from 'object-path-operator'
import { assert } from '@blackglory/errors'
import { FunctionKeys, KeysExtendType } from 'hotypes'
import { IRequest, IResponse, ParameterValidators } from '@src/types'

export type ImplementationOf<Obj> = {
  [Key in FunctionKeys<Obj> | KeysExtendType<Obj, object>]:
    Obj[Key] extends (...args: infer Args) => Awaited<infer Result>
      ? (...args: Args) => PromiseLike<Result> | Result
      : ImplementationOf<Obj[Key]>
}

export async function createResponse<Obj extends object, DataType = unknown>(
  api: ImplementationOf<Obj>
, request: IRequest<DataType>
, parameterValidators: ParameterValidators<Obj> = {}
): Promise<IResponse<DataType>> {
  try {
    const validate = tryGetProp(
      parameterValidators
    , request.method
    ) as ((...args: unknown[]) => void) | undefined
    validate?.(...request.params)
  } catch (e) {
    return createError(request.id, 'ParameterValidationError', `${e}`)
  }

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
