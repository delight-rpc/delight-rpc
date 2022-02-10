import { createResult } from '@src/utils/create-result'

test('createResult<DataType>(id: string, result: DataType): IReult<DataType>', () => {
  const result = createResult('id', 'result')

  expect(result).toStrictEqual({
    protocol: 'delight-rpc'
  , version: '2.0'
  , id: 'id'
  , result: 'result'
  })
})
