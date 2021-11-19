import { createRequest } from '@utils/create-request'

test(`
  createRequest<DataType>(
    id: string
  , method: string[]
  , params: DataType[]
  ): IRequest<DataType>
`, () => {
  const result = createRequest('id', ['hello'], ['world'])

  expect(result).toStrictEqual({
    protocol: 'delight-rpc'
  , version: '1.0'
  , id: 'id'
  , method: ['hello']
  , params: ['world']
  })
})
