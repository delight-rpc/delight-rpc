import { IBatchRequest, IRequestForBatchRequest } from '@src/types'
import { version } from './version'

export function createBatchRequest<DataType>(
  id: string
, requests: IRequestForBatchRequest<unknown, DataType>[]
, parallel: boolean
, expectedVersion?: `${number}.${number}.${number}`
): IBatchRequest<DataType> {
  if (expectedVersion) {
    return {
      protocol: 'delight-rpc'
    , version
    , expectedVersion
    , id
    , parallel
    , requests
    }
  } else {
    return {
      protocol: 'delight-rpc'
    , version
    , id
    , parallel
    , requests
    }
  }
}

export function createRequestForBatchRequest<DataType>(
  method: string[]
, params: DataType[]
): IRequestForBatchRequest<unknown, DataType> {
  return { method, params }
}
