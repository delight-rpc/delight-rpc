import { IBatchRequest } from '@delight-rpc/protocol'
import { isDelightRPC } from './is-delight-rpc.js'
import { isArray, isObject, isString, isBoolean } from '@blackglory/prelude'

export function isBatchRequest<T>(val: unknown): val is IBatchRequest<T> {
  return isDelightRPC(val)
      && isString(val.id)
      && isBoolean(val.parallel)
      && isArray(val.requests) && val.requests.every(request => (
           isObject(request) && (
             isArray(request.method) &&
             request.method.every(isString)
           ) &&
           isArray(request.params)
         ))
}
