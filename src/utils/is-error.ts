import { isRecord, isString } from '@blackglory/types'

export function isError(val: unknown): val is IError {
  return isRecord(val)
      && val.protocol === 'delight-rpc'
      && val.version === '1.0'
      && isString(val.id)
      && (
           isRecord(val.error) &&
           isString(val.error.type) &&
           isString(val.error.message)
         )
}
