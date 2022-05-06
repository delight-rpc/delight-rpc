import { createBatchResponse, createResultForBatchResponse, createErrorForBatchResponse } from '@utils/create-batch-response'

describe('createBatchResponse', () => {
  const result = createBatchResponse('id', [
    { result: 'result' }
  , {
      error: {
        name: 'UserError'
      , message: 'message'
      , stack: 'stack'
      , ancestors: ['Error']
      }
    }
  ])

  expect(result).toStrictEqual({
    protocol: 'delight-rpc'
  , id: 'id'
  , version: '2.2'
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
