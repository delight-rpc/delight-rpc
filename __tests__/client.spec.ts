import { JsonRpcRequest, JsonRpcResponse } from 'justypes'
import { createClient } from '@src/client'
import { getErrorPromise } from 'return-style'
import { CustomError } from '@blackglory/errors'
import '@blackglory/jest-matchers'

interface ICallables {
  method(message: string): string
}

describe('createClient', () => {
  it('create json rpc', () => {
    const send = jest.fn(async function (rpc: JsonRpcRequest<unknown>): Promise<JsonRpcResponse<unknown>> {
      return {
        jsonrpc: '2.0'
      , id: rpc.id
      , result: (rpc.params as unknown[])[0]
      }
    })
    const message = 'message'

    const client = createClient<ICallables>(send)
    client.method(message)

    expect(send).toBeCalledWith({
      jsonrpc: '2.0'
    , id: expect.any(String)
    , method: 'method'
    , params: [message]
    })
  })

  describe('success', () => {
    it('return Promise', async () => {
      async function send(rpc: JsonRpcRequest<unknown>): Promise<JsonRpcResponse<unknown>> {
        return {
          jsonrpc: '2.0'
        , id: rpc.id
        , result: (rpc.params as unknown[])[0]
        }
      }
      const message = 'message'

      const client = createClient<ICallables>(send)
      const result = client.method(message)
      const proResult = await result

      expect(result).toBePromise()
      expect(proResult).toBe(message)
    })
  })

  describe('error', () => {
    it('throw error', async () => {
      const errorMessage = 'error message'
      async function send(rpc: JsonRpcRequest<unknown>): Promise<JsonRpcResponse<unknown>> {
        return {
          jsonrpc: '2.0'
        , id: rpc.id
        , error: {
            code: -32000
          , message: errorMessage
          }
        }
      }
      const message = 'message'

      const client = createClient<ICallables>(send)
      const result = client.method(message)
      const proResult = await getErrorPromise(result)

      expect(result).toBePromise()
      expect(proResult).toBeInstanceOf(CustomError)
      expect(proResult!.message).toBe('error message')
    })
  })
})
