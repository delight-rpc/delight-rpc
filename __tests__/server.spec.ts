import { createResponse } from '@src/server'
import { IRequest } from '@src/types'
import '@blackglory/jest-matchers'

describe(`
  createResponse<Obj extends object, DataType = unknown>(
    api: Obj
  , request: IRequest<DataType>
  ): Promise<IResponse<DataType>>
`, () => {
  describe('method returns result', () => {
    it('return IResult', async () => {
      const method = jest.fn().mockImplementation(async (message: string) => message)
      const api = { echo: method }
      const request: IRequest<unknown> = {
        protocol: 'delight-rpc'
      , version: '1.0'
      , id: 'id'
      , method: ['echo']
      , params: ['message']
      }

      const result = createResponse(api, request)
      const proResult = await result

      expect(result).toBePromise()
      expect(proResult).toStrictEqual({
        protocol: 'delight-rpc'
      , version: '1.0'
      , id: 'id'
      , result: 'message'
      })
    })

    test('method with namespace', async () => {
      const method = jest.fn().mockImplementation(async (message: string) => message)
      const api = {
        namespace: { echo: method }
      }
      const request: IRequest<unknown> = {
        protocol: 'delight-rpc'
      , version: '1.0'
      , id: 'id'
      , method: ['namespace', 'echo']
      , params: ['message']
      }

      const result = createResponse(api, request)
      const proResult = await result

      expect(result).toBePromise()
      expect(method).toBeCalledTimes(1)
      expect(proResult).toStrictEqual({
        protocol: 'delight-rpc'
      , version: '1.0'
      , id: 'id'
      , result: 'message'
      })
    })
  })

  describe('method not available', () => {
    it('return IError', async () => {
      const api = {}
      const request: IRequest<unknown> = {
        protocol: 'delight-rpc'
      , version: '1.0'
      , id: 'id'
      , method: ['notFound']
      , params: ['message']
      }

      const result = createResponse(api, request)
      const proResult = await result

      expect(result).toBePromise()
      expect(proResult).toStrictEqual({
        protocol: 'delight-rpc'
      , version: '1.0'
      , id: 'id'
      , error: {
          type: 'MethodNotAvailable'
        , message: 'The method is not available.'
        }
      })
    })
  })

  describe('method throws error', () => {
    it('return IError', async () => {
      const method = jest.fn().mockImplementation(async () => {
        throw new Error('message')
      })
      const api = { throws: method }
      const request: IRequest<unknown> = {
        protocol: 'delight-rpc'
      , version: '1.0'
      , id: 'id'
      , method: ['throws']
      , params: []
      }

      const result = createResponse(api, request)
      const proResult = await result

      expect(result).toBePromise()
      expect(proResult).toStrictEqual({
        protocol: 'delight-rpc'
      , version: '1.0'
      , id: 'id'
      , error: {
          type: 'Error'
        , message: 'message'
        }
      })
    })
  })
})
