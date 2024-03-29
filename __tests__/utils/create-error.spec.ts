import { createError } from '@src/utils/create-error.js'

describe('createError', () => {
  describe('channel', () => {
    test('without channel', () => {
      class UserError extends Error {}
      const result = createError(
        'id'
      , new UserError('message')
      , undefined
      )

      expect(result).toStrictEqual({
        protocol: 'delight-rpc'
      , version: '3.1'
      , id: 'id'
      , error: {
          name: 'UserError'
        , message: 'message'
        , stack: expect.any(String)
        , ancestors: ['Error']
        }
      })
    })

    test('with channel', () => {
      class UserError extends Error {}
      const result = createError(
        'id'
      , new UserError('message')
      , 'channel'
      )

      expect(result).toStrictEqual({
        protocol: 'delight-rpc'
      , version: '3.1'
      , id: 'id'
      , error: {
          name: 'UserError'
        , message: 'message'
        , stack: expect.any(String)
        , ancestors: ['Error']
        }
      , channel: 'channel'
      })
    })
  })
})
