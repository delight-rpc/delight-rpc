import { isDelightRPC } from '@utils/is-delight-rpc.js'
import { IDelightRPC } from '@delight-rpc/protocol'

describe('isDelightRPC', () => {
  test('DelightRpc', () => {
    const val: IDelightRPC = {
      protocol: 'delight-rpc'
    , version: '3.1'
    }

    const result = isDelightRPC(val)

    expect(result).toBe(true)
  })

  test('others', () => {
    const val = {
      protocol: 'json-rpc'
    , version: '3.1'
    }

    const result = isDelightRPC(val)

    expect(result).toBe(false)
  })
})
