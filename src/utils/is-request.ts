import { isRecord, isString, isArray } from '@blackglory/types'
import { IRequest } from '@src/types'

export function isRequest<DataType>(val: unknown): val is IRequest<DataType> {
  return isRecord(val)
      && val.protocol === 'delight-rpc'
      && val.version === '1.0'
      && isString(val.id)
      && (
           isArray(val.method) &&
           val.method.every(isString)
         )
      && isArray(val.params)
}
