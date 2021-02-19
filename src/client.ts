import { nanoid } from 'nanoid'
import { JsonRpcRequest, JsonRpcResponse, isJsonRpcSuccess } from '@blackglory/types'
import { createRequestProxy } from 'json-rpc-proxy'
import { CustomError } from '@blackglory/errors'

export type RequestProxy<T> = {
  [P in keyof T]:
    T[P] extends (...args: infer U) => PromiseLike<infer V>
      ? (...args: U) => Promise<V>
      : (
          T[P] extends (...args: infer W) => infer X
          ? (...args: W) => Promise<X>
          : never
        )
}

export function createClient<T extends object, U = unknown>(
  request: (jsonRpc: JsonRpcRequest<U>) => PromiseLike<JsonRpcResponse<U>>
): RequestProxy<T> {
  const proxy = createRequestProxy(nanoid)

  return new Proxy(proxy as any, {
    get(target: T, prop: keyof T) {
      return async function (this: unknown, ...args: unknown[]) {
        const fn = target[prop]
        const jsonRpc = Reflect.apply(fn as any, this, args) as JsonRpcRequest<U>
        const response = await request(jsonRpc)
        if (isJsonRpcSuccess(response)) {
          return response.result
        } else {
          if (response.error.code === -32601) throw new MethodNotFound(response.error.message)
          throw new CustomError(response.error.message)
        }
      }
    }
  }) as RequestProxy<T>
}

export class MethodNotFound extends CustomError {}
