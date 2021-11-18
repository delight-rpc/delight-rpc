import { isntFunction } from '@blackglory/types'
import { JsonRpcRequest, JsonRpcResponse } from 'justypes'
import { success, error } from '@src/creator'
import { getParamsAsArray } from './utils'

export async function applyRequest<T>(
  callables: object
, request: JsonRpcRequest<T>
): Promise<JsonRpcResponse<T>> {
  const fn = Reflect.get(callables, request.method)
  if (isntFunction(fn)) {
    return error(request.id, -32601, 'The method does not exist / is not available.')
  }

  try {
    const result = await Reflect.apply(fn, callables, getParamsAsArray(request))
    return success(request.id, result)
  } catch (e) {
    return error(request.id, -32000, `${e}`)
  }
}
