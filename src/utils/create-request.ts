import { IRequest } from '@src/types'
import { isntUndefined } from '@blackglory/prelude'
import { version } from './version'

export function createRequest<DataType>(
  id: string
, method: string[]
, params: DataType[]
, expectedVersion: `${number}.${number}.${number}` | undefined
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
