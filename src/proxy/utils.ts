import { JsonRpcRequest, JsonRpcNotification } from 'justypes'

export function getParamsAsArray<T>(
  jsonRpc: JsonRpcRequest<T> | JsonRpcNotification<T>
): T[] | [Record<string, T>] {
  if (jsonRpc.params) {
    if (Array.isArray(jsonRpc.params)) {
      return jsonRpc.params
    } else {
      return [jsonRpc.params]
    }
  } else {
    return []
  }
}
