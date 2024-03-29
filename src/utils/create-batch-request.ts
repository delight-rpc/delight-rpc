import { version, IBatchRequest, IRequestForBatchRequest } from '@delight-rpc/protocol'
import { isntUndefined } from '@blackglory/prelude'

export function createBatchRequest<DataType>(
  id: string
, requests: IRequestForBatchRequest<unknown, DataType>[]
, parallel: boolean
, expectedVersion: string | undefined
, channel: string | undefined
): IBatchRequest<DataType> {
  const batchRequest: IBatchRequest<DataType> = {
    protocol: 'delight-rpc'
  , version
  , id
  , parallel
  , requests
  }
  if (isntUndefined(expectedVersion)) {
    batchRequest.expectedVersion = expectedVersion
  }
  if (isntUndefined(channel)) {
    batchRequest.channel = channel
  }

  return batchRequest
}

export function createRequestForBatchRequest<DataType>(
  method: string[]
, params: DataType[]
): IRequestForBatchRequest<unknown, DataType> {
  return { method, params }
}
