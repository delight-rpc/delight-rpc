import { isUndefined, isRegExp } from '@blackglory/prelude'
import { IRequest, IBatchRequest, IResponse, IBatchResponse } from '@delight-rpc/protocol'
import { AnyChannel } from '@src/types'

export function matchChannel<DataType>(
  requestOrResponse:
  | IRequest<DataType>
  | IBatchRequest<DataType>
  | IResponse<DataType>
  | IBatchResponse<DataType>
, channel:
  | undefined
  | string
  | RegExp
  | typeof AnyChannel
): boolean {
  if (channel !== AnyChannel) {
    if (isRegExp(channel)) {
      if (isUndefined(requestOrResponse.channel)) return false
      if (!channel.test(requestOrResponse.channel)) return false
    } else {
      if (channel !== requestOrResponse.channel) return false
    }
  }

  return true
}
