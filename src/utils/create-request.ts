import { IRequest } from '@src/types'

export function createRequest<DataType>(
  id: string
, method: string[]
, params: DataType[]
, expectedVersion?: `${number}.${number}.${number}`
): IRequest<DataType> {
  if (expectedVersion) {
    return {
      protocol: 'delight-rpc'
    , version: '2.0'
    , expectedVersion
    , id
    , method
    , params
    }
  } else {
    return {
      protocol: 'delight-rpc'
    , version: '2.0'
    , id
    , method
    , params
    }
  }
}
