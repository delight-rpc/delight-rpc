import { isString, isArray, isNull, isUndefined } from '@blackglory/prelude'
import { IRequest } from '@delight-rpc/protocol'
import { isDelightRPC } from './is-delight-rpc.js'

export function isRequest<DataType>(val: unknown): val is IRequest<DataType> {
  return isDelightRPC(val)
      && isString(val.id)
      && (
           isNull(val.expectedVersion) ||
           isUndefined(val.expectedVersion) ||
           isString(val.expectedVersion)
         )
      && (
           isArray(val.method) &&
           val.method.every(isString)
         )
      && isArray(val.params)
}
