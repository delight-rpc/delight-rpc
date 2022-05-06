import { createBatchRequest, createRequestForBatchRequest } from '@utils/create-batch-request'

describe('createBatchRequest', () => {
  test('without expectedVersion', () => {
    const result = createBatchRequest(
      'id'
    , [{ method: ['hello'], params: ['world'] }]
    , true
    )

    expect(result).toStrictEqual({
      protocol: 'delight-rpc'
    , version: '2.2'
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
    , '1.0.0'
    )

    expect(result).toStrictEqual({
      protocol: 'delight-rpc'
    , version: '2.2'
    , expectedVersion: '1.0.0'
    , id: 'id'
    , parallel: true
    , requests: [{ method: ['hello'], params: ['world'] }]
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
