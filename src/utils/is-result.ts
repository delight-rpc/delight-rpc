import { isPlainObject, isString } from '@blackglory/types'
import { IResult } from '@src/types'

export function isResult<DataType>(val: unknown): val is IResult<DataType> {
  return isPlainObject(val)
      && val.protocol === 'delight-rpc'
      && val.version === '1.0'
      && isString(val.id)
      && 'result' in val
}
