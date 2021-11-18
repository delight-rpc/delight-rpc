import { request } from '@src/creator/request'

test("request(obj: Omit<JsonRpcRequest<T>, 'jsonrpc'>): JsonRpcRequest<T>", () => {
  const result = request({ id: 0, method: 'hello' })

  expect(result).toStrictEqual({
    jsonrpc: '2.0'
  , id: 0
  , method: 'hello'
  })
})

describe('request(id: JsonRpcId, method: string, params?: JsonRpcParams<T>): JsonRpcRequest<T>', () => {
  test('params is undefined', () => {
    const result = request(0, 'hello')

    expect(result).toStrictEqual({
      jsonrpc: '2.0'
    , id: 0
    , method: 'hello'
    })
  })

  test('params isnt undefined', () => {
    const result = request(0, 'hello', ['world'])

    expect(result).toStrictEqual({
      jsonrpc: '2.0'
    , id: 0
    , method: 'hello'
    , params: ['world']
    })
  })
})
