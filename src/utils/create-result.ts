import { IResult } from '@src/types'
import { version } from './version'

export function createResult<DataType>(
  id: string
, result: DataType
): IResult<DataType> {
  return {
    protocol: 'delight-rpc'
  , version
  , id
  , result
  }
}
