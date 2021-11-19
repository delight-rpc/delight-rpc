export function createRequest<DataType>(
  id: string
, method: string[]
, params: DataType[]
): IRequest<DataType> {
  return {
    protocol: 'delight-rpc'
  , version: '1.0'
  , id
  , method
  , params
  }
}
