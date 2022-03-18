import { IBatchResponse, IResultForBatchResponse, IErrorForBatchResponse } from '@src/types'
import { version } from './version'
import { normalize } from '@blackglory/errors'

export function createBatchResponse<DataType>(
  id: string
, responses: Array<
  | IResultForBatchResponse<DataType>
  | IErrorForBatchResponse
  >
): IBatchResponse<DataType> {
  return {
    protocol: 'delight-rpc'
  , id
  , version
  , responses
  }
}

export function createErrorForBatchResponse(
  error: Error
): IErrorForBatchResponse {
  return { error: normalize(error) }
}

export function createResultForBatchResponse<DataType>(
  result: DataType
): IResultForBatchResponse<DataType> {
  return { result }
}
