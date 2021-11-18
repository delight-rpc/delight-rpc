import { isntUndefined } from '@blackglory/types'
import { JsonRpcId, JsonRpcError, JsonRpcErrorObject } from 'justypes'

export function error<T>(id: JsonRpcId, code: number, message: string, data?: T): JsonRpcError<T>
export function error<T>(id: JsonRpcId, error: JsonRpcErrorObject<T>): JsonRpcError<T>
export function error<T>(obj: Omit<JsonRpcError<T>, 'jsonrpc'>): JsonRpcError<T>
export function error<T>(...args:
| [id: JsonRpcId, code: number, message: string, data?: T]
| [id: JsonRpcId, error: JsonRpcErrorObject<T>]
| [obj: Omit<JsonRpcError<T>, 'jsonrpc'>]
): JsonRpcError<T> {
  if (args.length === 1) {
    const [obj] = args
    return normalizeError(obj)
  } else if (args.length === 2) {
    const [id, error] = args
    return createErrorByErrorObject(id, error)
  } else {
    const [id, code, message, data] = args
    return createError(id, code, message, data)
  }

}

function createErrorByErrorObject<T>(id: JsonRpcId, error: JsonRpcErrorObject<T>): JsonRpcError<T> {
  return {
    jsonrpc: '2.0'
  , id
  , error
  }
}

function createError<T>(id: JsonRpcId, code: number, message: string, data?: T): JsonRpcError<T> {
  const error: JsonRpcErrorObject<T> = { code, message }
  if (isntUndefined(data)) error.data = data

  return {
    jsonrpc: '2.0'
  , id
  , error
  }
}

function normalizeError<T>(obj: Omit<JsonRpcError<T>, 'jsonrpc'>): JsonRpcError<T> {
  return {
    jsonrpc: '2.0'
  , ...obj
  }
}
