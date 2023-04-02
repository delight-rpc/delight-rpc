import { createRequest } from '@utils/create-request.js'

describe('createRequest', () => {
  describe('expectedVersion', () => {
    test('without expectedVersion', () => {
      const result = createRequest(
        'id'
      , ['hello']
      , ['world']
      , undefined
      , undefined
      )

      expect(result).toStrictEqual({
        protocol: 'delight-rpc'
      , version: '3.1'
      , id: 'id'
      , method: ['hello']
      , params: ['world']
      })
    })

    test('with expectedVersion', () => {
      const result = createRequest(
        'id'
      , ['hello']
      , ['world']
      , '^1.0.0'
      , undefined
      )

      expect(result).toStrictEqual({
        protocol: 'delight-rpc'
      , version: '3.1'
      , expectedVersion: '^1.0.0'
      , id: 'id'
      , method: ['hello']
      , params: ['world']
      })
    })
  })

  describe('channel', () => {
    test('without channel', () => {
      const result = createRequest(
        'id'
      , ['hello']
      , ['world']
      , undefined
      , undefined
      )

      expect(result).toStrictEqual({
        protocol: 'delight-rpc'
      , version: '3.1'
      , id: 'id'
      , method: ['hello']
      , params: ['world']
      })
    })

    test('with channel', () => {
      const result = createRequest(
        'id'
      , ['hello']
      , ['world']
      , undefined
      , 'channel'
      )

      expect(result).toStrictEqual({
        protocol: 'delight-rpc'
      , version: '3.1'
      , id: 'id'
      , method: ['hello']
      , params: ['world']
      , channel: 'channel'
      })
    })
  })
})
