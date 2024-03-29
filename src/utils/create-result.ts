import { version, IResult } from '@delight-rpc/protocol'
import { isntUndefined } from '@blackglory/prelude'

export function createResult<DataType>(
  id: string
, value: DataType
, channel: string | undefined
): IResult<DataType> {
  const result: IResult<DataType> = {
    protocol: 'delight-rpc'
  , version
  , id
  , result: value
  }
  if (isntUndefined(channel)) {
    result.channel = channel
  }

  return result
}
