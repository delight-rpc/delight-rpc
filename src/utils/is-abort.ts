import { isString } from '@blackglory/prelude'
import { IAbort } from '@delight-rpc/protocol'
import { isDelightRPC } from './is-delight-rpc.js'

export function isAbort(val: unknown): val is IAbort {
  return isDelightRPC(val)
      && isString(val.id)
      && val.abort === true
}
