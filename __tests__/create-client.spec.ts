import { createClient } from '@src/create-client'
import { getErrorPromise, getError } from 'return-style'
import { VersionMismatch, MethodNotAvailable } from '@src/errors'
import { IRequest, IResponse } from '@delight-rpc/protocol'
import { normalize, CustomError } from '@blackglory/errors'
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

  describe('success', () => {
    it('return result', async () => {
      interface IAPI {
        echo(message: string): string
      }
      async function send(request: IRequest<unknown>): Promise<IResponse<unknown>> {
        return {
          protocol: 'delight-rpc'
        , version: '2.2'
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
      class UserError extends CustomError {}
      interface IAPI {
        echo(message: string): string
      }
      const errorMessage = 'error message'
      async function send(request: IRequest<unknown>): Promise<IResponse<unknown>> {
        return {
          protocol: 'delight-rpc'
        , version: '2.2'
        , id: request.id
        , error: normalize(new UserError(errorMessage))
        }
      }
      const message = 'message'

      const client = createClient<IAPI>(send)
      const result = client.echo(message)
      const proResult = await getErrorPromise(result)

      expect(result).toBePromise()
      expect(proResult).toBeInstanceOf(Error)
      expect(proResult).toBeInstanceOf(UserError)
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
        , version: '2.2'
        , id: request.id
        , error: normalize(new MethodNotAvailable(errorMessage))
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
      , version: '2.2'
      , id: request.id
      , result: request.params[0]
      }
    })
    const message = 'message'

    const client = createClient<IAPI>(send)
    client.namespace.echo(message)

    expect(send).toBeCalledWith({
      protocol: 'delight-rpc'
    , version: '2.2'
    , id: expect.any(String)
    , method: ['namespace', 'echo']
    , params: [message]
    })
  })

  describe('with expectedVersion', () => {
    describe('match', () => {
      it('return result', async () => {
        interface IAPI {
          echo(message: string): string
        }
        async function send(request: IRequest<unknown>): Promise<IResponse<unknown>> {
          return {
            protocol: 'delight-rpc'
          , version: '2.2'
          , id: request.id
          , result: request.params[0]
          }
        }
        const message = 'message'

        const client = createClient<IAPI>(send, {
          expectedVersion: '1.0.0'
        })
        const result = client.echo(message)
        const proResult = await result

        expect(result).toBePromise()
        expect(proResult).toBe(message)
      })
    })

    describe('mismatch', () => {
      it('throw VersionMismatch', async () => {
        interface IAPI {
          echo(message: string): string
        }
        const errorMessage = 'error message'
        async function send(request: IRequest<unknown>): Promise<IResponse<unknown>> {
          return {
            protocol: 'delight-rpc'
          , version: '2.2'
          , id: request.id
          , error: normalize(new VersionMismatch(errorMessage))
          }
        }
        const message = 'message'

        const client = createClient<IAPI>(send, {
          expectedVersion: '1.0.0'
        })
        const result = client.echo(message)
        const proResult = await getErrorPromise(result)

        expect(result).toBePromise()
        expect(proResult).toBeInstanceOf(VersionMismatch)
        expect(proResult!.message).toBe(errorMessage)
      })
    })
  })

  describe('with validators', () => {
    it('pass', async () => {
      interface IAPI {
        namespace: {
          echo(message: string): string
        }
      }
      const send = jest.fn(async function (request: IRequest<unknown>): Promise<IResponse<unknown>> {
        return {
          protocol: 'delight-rpc'
        , version: '2.2'
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

      const client = createClient<IAPI>(send, {
        parameterValidators: validators
      })
      client.namespace.echo(message)

      expect(validator).toBeCalledWith(message)
      expect(send).toBeCalledWith({
        protocol: 'delight-rpc'
      , version: '2.2'
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
        , version: '2.2'
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

      const client = createClient<IAPI>(send, {
        parameterValidators: validators
      })
      const err = getError(() => client.namespace.echo(message))

      expect(validator).toBeCalledWith(message)
      expect(err).toBeInstanceOf(Error)
      expect(err!.message).toBe('custom error')
    })
  })

  test('with channel', async () => {
    interface IAPI {
      echo(message: string): string
    }
    const send = jest.fn(async function (request: IRequest<unknown>): Promise<IResponse<unknown>> {
      return {
        protocol: 'delight-rpc'
      , version: '2.2'
      , id: request.id
      , result: request.params[0]
      }
    })
    const message = 'message'

    const client = createClient<IAPI>(send, {
      channel: 'channel'
    })
    await client.echo(message)

    expect(send).toBeCalledWith({
      protocol: 'delight-rpc'
    , version: '2.2'
    , id: expect.any(String)
    , method: ['echo']
    , params: [message]
    , channel: 'channel'
    })
  })
})
