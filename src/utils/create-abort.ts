import { version, IAbort } from '@delight-rpc/protocol'
import { isntUndefined } from '@blackglory/prelude'

export function createAbort(id: string, channel: string | undefined): IAbort {
  const abort: IAbort = {
    protocol: 'delight-rpc'
  , version
  , id
  , abort: true
  }
  if (isntUndefined(channel)) {
    abort.channel = channel
  }

  return abort
}
