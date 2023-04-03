import { IDelightRPC } from '@delight-rpc/protocol'
import { isResult } from '@utils/is-result.js'
import { createResult } from '@utils/create-result.js'

describe('isResult', () => {
  test('Result', () => {
    const val = createResult('id', 'val', undefined)

    const result = isResult(val)

    expect(result)
  })

  test('others', () => {
    const val: IDelightRPC = {
      protocol: 'delight-rpc'
    , version: '3.1'
    }

    const result = isResult(val)

    expect(result).toBe(false)
  })
})
