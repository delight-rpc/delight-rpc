import { isPlainObject, isString, isUndefined } from '@blackglory/prelude'
import { IDelightRPC } from '@delight-rpc/protocol'

export function isDelightRPC(val: unknown): val is IDelightRPC {
  return isPlainObject(val)
      && val.protocol === 'delight-rpc'
      && (
           isUndefined(val.channel) ||
           isString(val.channel)
         )
      && (
           isString(val.version) &&
           /^2\.\d+$/.test(val.version)
         )
}
