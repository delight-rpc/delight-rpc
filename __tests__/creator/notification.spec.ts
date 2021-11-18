import { notification } from '@src/creator/notification'

test("notification(obj: Omit<JsonRpcNotification<T>, 'jsonrpc'>): JsonRpcNotification<T>", () => {
  const result = notification({ method: 'hello' })

  expect(result).toStrictEqual({
    jsonrpc: '2.0'
  , method: 'hello'
  })
})

describe('notification<T(method: string, params?: JsonRpcParams<T>): JsonRpcNotification<T>', () => {
  test('params is undefined', () => {
    const result = notification('hello')

    expect(result).toStrictEqual({
      jsonrpc: '2.0'
    , method: 'hello'
    })
  })

  test('params isnt undefined', () => {
    const result = notification('hello', ['world'])

    expect(result).toStrictEqual({
      jsonrpc: '2.0'
    , method: 'hello'
    , params: ['world']
    })
  })
})
