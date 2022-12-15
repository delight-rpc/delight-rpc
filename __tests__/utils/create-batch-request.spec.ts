import { createBatchRequest, createRequestForBatchRequest } from '@utils/create-batch-request'

describe('createBatchRequest', () => {
  describe('expectedVersion', () => {
    test('without expectedVersion', () => {
      const result = createBatchRequest(
        'id'
      , [{ method: ['hello'], params: ['world'] }]
      , true
      , undefined
      , undefined
      )

      expect(result).toStrictEqual({
        protocol: 'delight-rpc'
      , version: '3.0'
      , id: 'id'
      , parallel: true
      , requests: [{ method: ['hello'], params: ['world'] }]
      })
    })

    test('with expectedVersion', () => {
      const result = createBatchRequest(
        'id'
      , [{ method: ['hello'], params: ['world'] }]
      , true
      , '^1.0.0'
      , undefined
      )

      expect(result).toStrictEqual({
        protocol: 'delight-rpc'
      , version: '3.0'
      , expectedVersion: '^1.0.0'
      , id: 'id'
      , parallel: true
      , requests: [{ method: ['hello'], params: ['world'] }]
      })
    })
  })

  describe('channel', () => {
    test('without channel', () => {
      const result = createBatchRequest(
        'id'
      , [{ method: ['hello'], params: ['world'] }]
      , true
      , undefined
      , undefined
      )

      expect(result).toStrictEqual({
        protocol: 'delight-rpc'
      , version: '3.0'
      , id: 'id'
      , parallel: true
      , requests: [{ method: ['hello'], params: ['world'] }]
      })
    })

    test('with channel', () => {
      const result = createBatchRequest(
        'id'
      , [{ method: ['hello'], params: ['world'] }]
      , true
      , undefined
      , 'channel'
      )

      expect(result).toStrictEqual({
        protocol: 'delight-rpc'
      , version: '3.0'
      , id: 'id'
      , parallel: true
      , requests: [{ method: ['hello'], params: ['world'] }]
      , channel: 'channel'
      })
    })
  })
})

test('createRequestForBatchRequest', () => {
  const result = createRequestForBatchRequest(['hello'], ['world'])

  expect(result).toStrictEqual({
    method: ['hello']
  , params: ['world']
  })
})
