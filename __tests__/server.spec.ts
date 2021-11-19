import { createResponse } from '@src/server'
import '@blackglory/jest-matchers'

interface IAPI {
  echo(message: string): Promise<string>
  throws(): Promise<void>
}

const api: IAPI = {
  async echo(message: string): Promise<string> {
    return message
  }
, async throws() {
    throw new Error('message')
  }
}

describe('createResponse', () => {
  describe('method returns result', () => {
    it('return IResult', async () => {
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
  })

  describe('method not available', () => {
    it('return IError', async () => {
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
