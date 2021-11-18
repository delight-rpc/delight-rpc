import { JsonRpcRequest, JsonRpcNotification, JsonRpcResponse } from 'justypes'

export function batch<T>(
  ...requests: Array<JsonRpcRequest<T> | JsonRpcNotification<T>>
): Array<JsonRpcRequest<T> | JsonRpcNotification<T>>
export function batch<T>(
  ...responses: Array<JsonRpcResponse<T>>
): Array<JsonRpcResponse<T>>
export function batch<T>(...args:
| [...requests: Array<JsonRpcRequest<T> | JsonRpcNotification<T>>]
| [...responses: Array<JsonRpcResponse<T>>]
) {
  return args
}
