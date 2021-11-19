import { createError } from '@src/utils/create-error'

test(`
  createError(
    id: string
  , type: string
  , message: string
  ): IError
`, () => {
  const result = createError('id', 'type', 'message')

  expect(result).toStrictEqual({
    protocol: 'delight-rpc'
  , version: '1.0'
  , id: 'id'
  , error: {
      type: 'type'
    , message: 'message'
    }
  })
})
