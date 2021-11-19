import { createClient } from '@src/client'
import { getErrorPromise } from 'return-style'
import '@blackglory/jest-matchers'

interface IAPI {
  echo(message: string): string
  namespace: {
    echo(message: string): string
  }
}

describe('createClient', () => {
  describe('then method', () => {
    it('return undefined', () => {
      const send = jest.fn()

      const client = createClient(send)

      // @ts-ignore
      expect(client.then).toBeUndefined()
    })
  })

  it('creates a request', () => {
    const send = jest.fn(async function (request: IRequest<unknown>): Promise<IResponse<unknown>> {
      return {
        protocol: 'delight-rpc'
      , version: '1.0'
      , id: request.id
      , result: request.params[0]
      }
    })
    const message = 'message'

    const client = createClient<IAPI>(send)
    client.namespace.echo(message)

    expect(send).toBeCalledWith({
      protocol: 'delight-rpc'
    , version: '1.0'
    , id: expect.any(String)
    , method: ['namespace', 'echo']
    , params: [message]
    })
  })

  describe('success', () => {
    it('return result', async () => {
      async function send(request: IRequest<unknown>): Promise<IResponse<unknown>> {
        return {
          protocol: 'delight-rpc'
        , version: '1.0'
        , id: request.id
        , result: request.params[0]
        }
      }
      const message = 'message'

      const client = createClient<IAPI>(send)
      const result = client.echo(message)
      const proResult = await result

      expect(result).toBePromise()
      expect(proResult).toBe(message)
    })
  })

  describe('error', () => {
    it('throw Error', async () => {
      const errorType = 'UserError'
      const errorMessage = 'error message'
      async function send(request: IRequest<unknown>): Promise<IResponse<unknown>> {
        return {
          protocol: 'delight-rpc'
        , version: '1.0'
        , id: request.id
        , error: {
            type: errorType
          , message: errorMessage
          }
        }
      }
      const message = 'message'

      const client = createClient<IAPI>(send)
      const result = client.echo(message)
      const proResult = await getErrorPromise(result)

      expect(result).toBePromise()
      expect(proResult).toBeInstanceOf(Error)
      expect(proResult!.message).toBe(`${errorType}: ${errorMessage}`)
    })
  })
})
