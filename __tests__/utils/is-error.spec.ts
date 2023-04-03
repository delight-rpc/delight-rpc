import { isError } from '@utils/is-error.js'
import { createError } from '@utils/create-error.js'
import { IDelightRPC } from '@delight-rpc/protocol'

describe('isError', () => {
  test('Error', () => {
    const val = createError('id', new Error(), undefined)

    const result = isError(val)

    expect(result).toBe(true)
  })

  test('others', () => {
    const val: IDelightRPC = {
      protocol: 'delight-rpc'
    , version: '3.1'
    }

    const result = isError(val)

    expect(result).toBe(false)
  })
})
