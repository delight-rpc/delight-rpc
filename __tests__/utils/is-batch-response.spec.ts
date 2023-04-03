import { isBatchResponse } from '@utils/is-batch-response.js'
import { createBatchResponse } from '@utils/create-batch-response.js'
import { IDelightRPC } from '@delight-rpc/protocol'

describe('isBatchResponse', () => {
  test('BatchResponse', () => {
    const val = createBatchResponse('id', [], undefined)

    const result = isBatchResponse(val)

    expect(result).toBe(true)
  })

  test('others', () => {
    const val: IDelightRPC = {
      protocol: 'delight-rpc'
    , version: '3.1'
    }

    const result = isBatchResponse(val)

    expect(result).toBe(false)
  })
})
