import { isPlainObject, isString } from '@blackglory/types'
import { IError } from '@src/types'

export function isError(val: unknown): val is IError {
  return isPlainObject(val)
      && val.protocol === 'delight-rpc'
      && val.version === '1.0'
      && isString(val.id)
      && (
           isPlainObject(val.error) &&
           isString(val.error.type) &&
           isString(val.error.message)
         )
}
