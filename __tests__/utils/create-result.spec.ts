import { createResult } from '@src/utils/create-result'

test('createResult', () => {
  const result = createResult('id', 'result')

  expect(result).toStrictEqual({
    protocol: 'delight-rpc'
  , version: '2.1'
  , id: 'id'
  , result: 'result'
  })
})
