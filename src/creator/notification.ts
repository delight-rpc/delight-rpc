import { isString } from '@blackglory/types'
import { JsonRpcNotification, JsonRpcParams } from 'justypes'

export function notification<T>(method: string, params?: JsonRpcParams<T>): JsonRpcNotification<T>
export function notification<T>(obj: Omit<JsonRpcNotification<T>, 'jsonrpc'>): JsonRpcNotification<T>
export function notification<T>(...args:
| [method: string, params?: JsonRpcParams<T>]
| [obj: Omit<JsonRpcNotification<T>, 'jsonrpc'>]
) {
  if (isString(args[0])) {
    const [method, params] = args
    return createNotification(method, params)
  } else {
    const [obj] = args
    return normalizeNotification(obj)
  }
}

function createNotification<T>(method: string, params?: JsonRpcParams<T>): JsonRpcNotification<T> {
  const request: JsonRpcNotification<T> = {
    jsonrpc: '2.0'
  , method
  }
  if (params) request.params = params

  return request
}

function normalizeNotification<T>(obj: Omit<JsonRpcNotification<T>, 'jsonrpc'>): JsonRpcNotification<T> {
  return {
    jsonrpc: '2.0'
  , ...obj
  }
}
