import { createRequest } from '@utils/create-request'

describe('createRequest', () => {
  test('without expectedVersion', () => {
    const result = createRequest('id', ['hello'], ['world'])

    expect(result).toStrictEqual({
      protocol: 'delight-rpc'
    , version: '2.2'
    , id: 'id'
    , method: ['hello']
    , params: ['world']
    })
  })

  test('with expectedVersion', () => {
    const result = createRequest('id', ['hello'], ['world'], '1.0.0')

    expect(result).toStrictEqual({
      protocol: 'delight-rpc'
    , version: '2.2'
    , expectedVersion: '1.0.0'
    , id: 'id'
    , method: ['hello']
    , params: ['world']
    })
  })
})
