import { isString } from '@blackglory/prelude'
import { isSerializableError } from '@blackglory/errors'
import { IError } from '@delight-rpc/protocol'
import { isDelightRPC } from './is-delight-rpc.js'

export function isError(val: unknown): val is IError {
  return isDelightRPC(val)
      && isString(val.id)
      && isSerializableError(val.error)
}
