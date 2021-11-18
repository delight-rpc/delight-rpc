import { JsonRpcId, JsonRpcSuccess } from 'justypes'

export function success<T>(id: JsonRpcId, result: T): JsonRpcSuccess<T>
export function success<T>(obj: Omit<JsonRpcSuccess<T>, 'jsonrpc'>): JsonRpcSuccess<T>
export function success<T>(...args:
| [id: JsonRpcId, result: T]
| [obj: Omit<JsonRpcSuccess<T>, 'jsonrpc'>]
) {
  if (args.length === 1) {
    const [obj] = args
    return normalizeSuccess(obj)
  } else {
    const [id, result] = args
    return createSuccess(id, result)
  }
}

function createSuccess<T>(id: JsonRpcId, result: T): JsonRpcSuccess<T> {
  return {
    jsonrpc: '2.0'
  , id
  , result
  }
}

function normalizeSuccess<T>(obj: Omit<JsonRpcSuccess<T>, 'jsonrpc'>): JsonRpcSuccess<T> {
  return {
    jsonrpc: '2.0'
  , ...obj
  }
}
