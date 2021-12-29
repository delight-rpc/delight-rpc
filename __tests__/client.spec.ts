import { createClient, MethodNotAvailable, ParameterValidationError } from '@src/client'
import { getErrorPromise, getError } from 'return-style'
import { IRequest, IResponse } from '@src/types'
import '@blackglory/jest-matchers'

describe('createClient', () => {
  describe('then method', () => {
    it('return undefined', () => {
      const send = jest.fn()

      const client = createClient(send)

      // @ts-ignore
      expect(client.then).toBeUndefined()
    })
  })

  describe('create a request without a validator', () => {
    describe('success', () => {
      it('return result', async () => {
        interface IAPI {
          echo(message: string): string
        }
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
        interface IAPI {
          echo(message: string): string
        }
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

    describe('method not available', () => {
      it('throw MethodNotAvailable', async () => {
        interface IAPI {
          echo(message: string): string
        }
        const errorMessage = 'error message'
        async function send(request: IRequest<unknown>): Promise<IResponse<unknown>> {
          return {
            protocol: 'delight-rpc'
          , version: '1.0'
          , id: request.id
          , error: {
              type: 'MethodNotAvailable'
            , message: errorMessage
            }
          }
        }
        const message = 'message'

        const client = createClient<IAPI>(send)
        const result = client.echo(message)
        const proResult = await getErrorPromise(result)

        expect(result).toBePromise()
        expect(proResult).toBeInstanceOf(MethodNotAvailable)
        expect(proResult!.message).toBe(errorMessage)
      })
    })

    test('with namespace', () => {
      interface IAPI {
        namespace: {
          echo(message: string): string
        }
      }
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
  })

  describe('create a request with a validator', () => {
    it('pass', () => {
      interface IAPI {
        namespace: {
          echo(message: string): string
        }
      }
      const send = jest.fn(async function (request: IRequest<unknown>): Promise<IResponse<unknown>> {
        return {
          protocol: 'delight-rpc'
        , version: '1.0'
        , id: request.id
        , result: request.params[0]
        }
      })
      const validator = jest.fn()
      const validators = {
        namespace: {
          echo: validator
        }
      }
      const message = 'message'

      const client = createClient<IAPI>(send, validators)
      client.namespace.echo(message)

      expect(validator).toBeCalledWith(message)
      expect(send).toBeCalledWith({
        protocol: 'delight-rpc'
      , version: '1.0'
      , id: expect.any(String)
      , method: ['namespace', 'echo']
      , params: [message]
      })
    })

    it('not pass', () => {
      interface IAPI {
        namespace: {
          echo(message: string): string
        }
      }
      const send = jest.fn(async function (request: IRequest<unknown>): Promise<IResponse<unknown>> {
        return {
          protocol: 'delight-rpc'
        , version: '1.0'
        , id: request.id
        , result: request.params[0]
        }
      })
      const validator = jest.fn(() => {
        throw new Error('custom error')
      })
      const validators = {
        namespace: {
          echo: validator
        }
      }
      const message = 'message'

      const client = createClient<IAPI>(send, validators)
      const err = getError(() => client.namespace.echo(message))

      expect(validator).toBeCalledWith(message)
      expect(err).toBeInstanceOf(ParameterValidationError)
    })
  })
})
