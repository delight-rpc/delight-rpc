import { JsonRpcId, JsonRpcRequest, JsonRpcParams } from 'justypes'

export function request<T>(id: JsonRpcId, method: string, params?: JsonRpcParams<T>): JsonRpcRequest<T>
export function request<T>(obj: Omit<JsonRpcRequest<T>, 'jsonrpc'>): JsonRpcRequest<T>
export function request<T>(...args:
| [id: JsonRpcId, method: string, params?: JsonRpcParams<T>]
| [obj: Omit<JsonRpcRequest<T>, 'jsonrpc'>]
) {
  if (args.length === 1) {
    const [obj] = args
    return normalizeRequest(obj)
  } else {
    const [id, method, params] = args
    return createRequest(id, method, params)
  }
}

function createRequest<T>(id: JsonRpcId, method: string, params?: JsonRpcParams<T>): JsonRpcRequest<T> {
  const request: JsonRpcRequest<T> = {
    jsonrpc: '2.0'
  , id
  , method
  }
  if (params) request.params = params
  return request
}

function normalizeRequest<T>(obj: Omit<JsonRpcRequest<T>, 'jsonrpc'>): JsonRpcRequest<T> {
  return {
    jsonrpc: '2.0'
  , ...obj
  }
}
