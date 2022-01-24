import { isPlainObject, isString } from '@blackglory/types'
import { IDelightRPC } from '@src/types'

export function isDelightRPC(val: unknown): val is IDelightRPC {
  return isPlainObject(val)
      && val.protocol === 'delight-rpc'
      && isString(val.version) && /^1\.\d+$/.test(val.version)
}
