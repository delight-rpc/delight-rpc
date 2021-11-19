import { isRecord, isString } from '@blackglory/types'

export function isResult<DataType>(val: unknown): val is IResult<DataType> {
  return isRecord(val)
      && val.protocol === 'delight-rpc'
      && val.version === '1.0'
      && isString(val.id)
      && 'result' in val
}
