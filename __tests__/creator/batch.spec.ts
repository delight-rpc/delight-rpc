import { notification } from '@src/creator/notification'
import { request } from '@src/creator/request'
import { success } from '@src/creator/success'
import { error } from '@src/creator/error'
import { batch } from '@src/creator/batch'

test('batch(requests: Array<JsonRpcRequest<T> | JsonRpcNotification<T>>): Array<JsonRpcRequest<T> | JsonRpcNotification<T>>', () => {
  const result = batch(
    notification('hello')
  , request(0, 'hello')
  )

  expect(result).toStrictEqual([
    {
      jsonrpc: '2.0'
    , method: 'hello'
    }
  , {
      jsonrpc: '2.0'
    , id: 0
    , method: 'hello'
    }
  ])
})

test('batch(...responses: Array<JsonRpcResponse<T>>): Array<JsonRpcResponse<T>>', () => {
  const result = batch(
    success(0, 'ok')
  , error(1, 404, 'not found')
  )

  expect(result).toStrictEqual([
    {
      jsonrpc: '2.0'
    , id: 0
    , result: 'ok'
    }
  , {
      jsonrpc: '2.0'
    , id: 1
    , error: {
        code: 404
      , message: 'not found'
      }
    }
  ])
})
