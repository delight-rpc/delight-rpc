import { isUndefined, isRegExp } from '@blackglory/prelude'
import { IDelightRPC } from '@delight-rpc/protocol'
import { AnyChannel } from '@src/types.js'

export function matchChannel(
  message: IDelightRPC
, channel:
  | undefined
  | string
  | RegExp
  | typeof AnyChannel
): boolean {
  if (channel !== AnyChannel) {
    if (isRegExp(channel)) {
      if (isUndefined(message.channel)) return false
      if (!channel.test(message.channel)) return false
    } else {
      if (channel !== message.channel) return false
    }
  }

  return true
}
