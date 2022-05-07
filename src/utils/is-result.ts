import { isString } from '@blackglory/prelude'
import { IResult } from '@delight-rpc/protocol'
import { isDelightRPC } from './is-delight-rpc'

export function isResult<DataType>(val: unknown): val is IResult<DataType> {
  return isDelightRPC(val)
      && isString(val.id)
      && 'result' in val
}
