import { isString } from '@blackglory/prelude'
import { isSerializableError } from '@blackglory/errors'
import { IError } from '@src/types'
import { isDelightRPC } from './is-delight-rpc'

export function isError(val: unknown): val is IError {
  return isDelightRPC(val)
      && isString(val.id)
      && isSerializableError(val.error)
}
