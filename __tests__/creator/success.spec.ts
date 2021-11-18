import { success } from '@src/creator/success'

test("success(obj: Omit<JsonRpcSuccessResponse<T>, 'jsonrpc'>): JsonRpcSuccessResponse<T>", () => {
  const result = success({ id: 0, result: 'ok' })

  expect(result).toStrictEqual({
    jsonrpc: '2.0'
  , id: 0
  , result: 'ok'
  })
})

test('success(id: JsonRpcId, result: T): JsonRpcSuccessResponse<T>', () => {
  const result = success(0, 'ok')

  expect(result).toStrictEqual({
    jsonrpc: '2.0'
  , id: 0
  , result: 'ok'
  })
})
