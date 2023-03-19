import { createResult } from '@src/utils/create-result.js'

describe('createResult', () => {
  describe('channel', () => {
    test('without channel', () => {
      const result = createResult('id', 'result', undefined)

      expect(result).toStrictEqual({
        protocol: 'delight-rpc'
      , version: '3.0'
      , id: 'id'
      , result: 'result'
      })
    })

    test('with channel', () => {
      const result = createResult('id', 'result', 'channel')

      expect(result).toStrictEqual({
        protocol: 'delight-rpc'
      , version: '3.0'
      , id: 'id'
      , result: 'result'
      , channel: 'channel'
      })
    })
  })
})
