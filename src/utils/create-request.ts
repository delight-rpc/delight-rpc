import { version, IRequest } from '@delight-rpc/protocol'
import { isntUndefined } from '@blackglory/prelude'

export function createRequest<DataType>(
  id: string
, method: string[]
, params: DataType[]
, expectedVersion: string | undefined
, channel: string | undefined
): IRequest<DataType> {
  const request: IRequest<DataType> = {
    protocol: 'delight-rpc'
  , version
  , id
  , method
  , params
  }
  if (isntUndefined(expectedVersion)) {
    request.expectedVersion = expectedVersion
  }
  if (isntUndefined(channel)) {
    request.channel = channel
  }

  return request
}
