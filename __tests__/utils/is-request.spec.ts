import { isRequest } from '@utils/is-request.js'
import { createRequest } from '@utils/create-request.js'
import { IDelightRPC } from '@delight-rpc/protocol'

describe('isRequest', () => {
  test('Request', () => {
    const val = createRequest('id', [], [], undefined, undefined)

    const result = isRequest(val)

    expect(result).toBe(true)
  })

  test('others', () => {
    const val: IDelightRPC = {
      protocol: 'delight-rpc'
    , version: '3.1'
    }

    const result = isRequest(val)

    expect(result).toBe(false)
  })
})
