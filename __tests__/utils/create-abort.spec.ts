import { createAbort } from '@utils/create-abort.js'

describe('createAbort', () => {
  describe('channel', () => {
    test('without channel', () => {
      const result = createAbort('id', undefined)

      expect(result).toStrictEqual({
        protocol: 'delight-rpc'
      , version: '3.1'
      , id: 'id'
      , abort: true
      })
    })

    test('with channel', () => {
      const result = createAbort('id', 'channel')

      expect(result).toStrictEqual({
        protocol: 'delight-rpc'
      , version: '3.1'
      , id: 'id'
      , abort: true
      , channel: 'channel'
      })
    })
  })
})
