import { IResult } from '@src/types'

export function createResult<DataType>(
  id: string
, result: DataType
): IResult<DataType> {
  return {
    protocol: 'delight-rpc'
  , version: '2.0'
  , id
  , result
  }
}
