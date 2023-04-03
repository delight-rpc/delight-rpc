import { isBatchRequest } from '@utils/is-batch-request.js'
import { createBatchRequest } from '@utils/create-batch-request.js'
import { IDelightRPC } from '@delight-rpc/protocol'

describe('isBatchRequest', () => {
  test('BatchRequest', () => {
    const val = createBatchRequest('id', [], false, undefined, undefined)

    const result = isBatchRequest(val)

    expect(result).toBe(true)
  })

  test('others', () => {
    const val: IDelightRPC = {
      protocol: 'delight-rpc'
    , version: '3.1'
    }

    const result = isBatchRequest(val)

    expect(result).toBe(false)
  })
})
