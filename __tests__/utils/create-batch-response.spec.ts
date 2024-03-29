import { createBatchResponse, createResultForBatchResponse, createErrorForBatchResponse } from '@utils/create-batch-response.js'

describe('createBatchResponse', () => {
  describe('channel', () => {
    test('without channel', () => {
      const result = createBatchResponse(
        'id'
      , [
          { result: 'result' }
        , {
            error: {
              name: 'UserError'
            , message: 'message'
            , stack: 'stack'
            , ancestors: ['Error']
            }
          }
        ]
      , undefined
      )

      expect(result).toStrictEqual({
        protocol: 'delight-rpc'
      , id: 'id'
      , version: '3.1'
      , responses: [
          { result: 'result' }
        , {
            error: {
              name: 'UserError'
            , message: 'message'
            , stack: 'stack'
            , ancestors: ['Error']
            }
          }
        ]
      })
    })

    test('with channel', () => {
      const result = createBatchResponse(
        'id'
      , [
          { result: 'result' }
        , {
            error: {
              name: 'UserError'
            , message: 'message'
            , stack: 'stack'
            , ancestors: ['Error']
            }
          }
        ]
      , 'channel'
      )

      expect(result).toStrictEqual({
        protocol: 'delight-rpc'
      , id: 'id'
      , version: '3.1'
      , responses: [
          { result: 'result' }
        , {
            error: {
              name: 'UserError'
            , message: 'message'
            , stack: 'stack'
            , ancestors: ['Error']
            }
          }
        ]
      , channel: 'channel'
      })
    })
  })
})

test('createResultForBatchResponse', () => {
  const result = createResultForBatchResponse('result')

  expect(result).toStrictEqual({
    result: 'result'
  })
})

test('createErrorForBatchResponse', () => {
  class UserError extends Error {}
  const result = createErrorForBatchResponse(new UserError('message'))

  expect(result).toStrictEqual({
    error: {
      name: 'UserError'
    , message: 'message'
    , stack: expect.any(String)
    , ancestors: ['Error']
    }
  })
})
