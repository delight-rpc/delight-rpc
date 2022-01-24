import { isPlainObject, isString } from '@blackglory/types'
import { IError } from '@src/types'
import { isDelightRPC } from './is-delight-rpc'

export function isError(val: unknown): val is IError {
  return isDelightRPC(val)
      && isString(val.id)
      && (
           isPlainObject(val.error) &&
           isString(val.error.type) &&
           isString(val.error.message)
         )
}
