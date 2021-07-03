import { JsonRpcRequest, JsonRpcResponse } from 'justypes'
import { applyRequest } from 'json-rpc-proxy'

export async function createResponse<T extends object, U = unknown>(callables: T, request: JsonRpcRequest<U>): Promise<JsonRpcResponse<U>> {
  return await applyRequest(callables, request)
}
