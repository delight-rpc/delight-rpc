import { createResponse } from '@src/server'
import { JsonRpcRequest } from 'justypes'
import '@blackglory/jest-matchers'

interface ICallable {
  method(message: string): Promise<string>
  throws(): Promise<void>
}

const Callable: ICallable = {
  async method(message: string): Promise<string> {
    return message
  }
, async throws() {
    throw new Error('message')
  }
}

describe('createResponse', () => {
  describe('', () => {
    it('return JsonRpcResult', async () => {
      const request: JsonRpcRequest<unknown> = {
        jsonrpc: '2.0'
      , id: 'id'
      , method: 'method'
      , params: ['message']
      }

      const result = createResponse(Callable, request)
      const proResult = await result

      expect(result).toBePromise()
      expect(proResult).toStrictEqual({
        jsonrpc: '2.0'
      , id: 'id'
      , result: 'message'
      })
    })
  })

  describe('method not found', () => {
    it('return JsonRpcError', async () => {
      const request: JsonRpcRequest<unknown> = {
        jsonrpc: '2.0'
      , id: 'id'
      , method: 'badMethod'
      , params: ['message']
      }

      const result = createResponse(Callable, request)
      const proResult = await result

      expect(result).toBePromise()
      expect(proResult).toStrictEqual({
        jsonrpc: '2.0'
      , id: 'id'
      , error: {
          code: -32601
        , message: 'The method does not exist / is not available.'
        }
      })
    })
  })

  describe('method throws throw', () => {
    it('return JsonRpcError', async () => {
      const request: JsonRpcRequest<unknown> = {
        jsonrpc: '2.0'
      , id: 'id'
      , method: 'throws'
      }

      const result = createResponse(Callable, request)
      const proResult = await result

      expect(result).toBePromise()
      expect(proResult).toStrictEqual({
        jsonrpc: '2.0'
      , id: 'id'
      , error: {
          code: -32000
        , message: 'Error: message'
        }
      })
    })
  })
})
