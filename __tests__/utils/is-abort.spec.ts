import { isAbort } from '@utils/is-abort.js'
import { createAbort } from '@utils/create-abort.js'
import { IDelightRPC } from '@delight-rpc/protocol'

describe('isAbort', () => {
  test('Abort', () => {
    const val = createAbort('id', undefined)

    const result = isAbort(val)

    expect(result).toBe(true)
  })

  test('others', () => {
    const val: IDelightRPC = {
      protocol: 'delight-rpc'
    , version: '3.1'
    }

    const result = isAbort(val)

    expect(result).toBe(false)
  })
})
