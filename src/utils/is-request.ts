import { isString, isArray } from '@blackglory/types'
import { IRequest } from '@src/types'
import { isDelightRPC } from './is-delight-rpc'

export function isRequest<DataType>(val: unknown): val is IRequest<DataType> {
  return isDelightRPC(val)
      && isString(val.id)
      && (
           isArray(val.method) &&
           val.method.every(isString)
         )
      && isArray(val.params)
}
