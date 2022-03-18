import { createError } from '@src/utils/create-error'

test('createError', () => {
  class UserError extends Error {}
  const result = createError('id', new UserError('message'))

  expect(result).toStrictEqual({
    protocol: 'delight-rpc'
  , version: '2.1'
  , id: 'id'
  , error: {
      name: 'UserError'
    , message: 'message'
    , stack: expect.any(String)
    , ancestors: ['Error']
    }
  })
})
