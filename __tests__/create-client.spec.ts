import { createClient } from '@src/create-client.js'
import { getErrorPromise, getError } from 'return-style'
import { VersionMismatch, MethodNotAvailable } from '@src/errors.js'
import { IRequest, IResponse } from '@delight-rpc/protocol'
import { normalize, CustomError } from '@blackglory/errors'
import { jest } from '@jest/globals'

describe('createClient', () => {
  test('then method', () => {
    const send = jest.fn()
    // @ts-ignore
    const client = createClient(send)

    const exists = 'then' in client
    // @ts-ignore
    const value = client.then

    expect(exists).toBe(false)
    expect(value).toBe(undefined)
  })

  test('toJSON method', () => {
    const send = jest.fn()
    // @ts-ignore
    const client = createClient(send)

    const exists = 'toJSON' in client
    // @ts-ignore
    const value = client.toJSON

    expect(exists).toBe(false)
    expect(value).toBe(undefined)
  })

  test('success', async () => {
    interface IAPI {
      echo(message: string): string
    }
    async function send(request: IRequest<unknown>): Promise<IResponse<unknown>> {
      return {
        protocol: 'delight-rpc'
      , version: '3.1'
      , id: request.id
      , result: request.params[0]
      }
    }
    const message = 'message'

    const client = createClient<IAPI>(send)
    const result = await client.echo(message)

    expect(result).toBe(message)
  })

  test('error', async () => {
    class UserError extends CustomError {}
    interface IAPI {
      echo(message: string): string
    }
    const errorMessage = 'error message'
    async function send(request: IRequest<unknown>): Promise<IResponse<unknown>> {
      return {
        protocol: 'delight-rpc'
      , version: '3.1'
      , id: request.id
      , error: normalize(new UserError(errorMessage))
      }
    }
    const message = 'message'

    const client = createClient<IAPI>(send)
    const err = await getErrorPromise(client.echo(message))

    expect(err).toBeInstanceOf(Error)
    expect(err).toBeInstanceOf(UserError)
  })

  test('method not available', async () => {
    interface IAPI {
      echo(message: string): string
    }
    const errorMessage = 'error message'
    async function send(request: IRequest<unknown>): Promise<IResponse<unknown>> {
      return {
        protocol: 'delight-rpc'
      , version: '3.1'
      , id: request.id
      , error: normalize(new MethodNotAvailable(errorMessage))
      }
    }
    const message = 'message'

    const client = createClient<IAPI>(send)
    const result = await getErrorPromise(client.echo(message))

    expect(result).toBeInstanceOf(MethodNotAvailable)
    expect(result!.message).toBe(errorMessage)
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
      , version: '3.1'
      , id: request.id
      , result: request.params[0]
      }
    })
    const message = 'message'

    const client = createClient<IAPI>(send)
    client.namespace.echo(message)

    expect(send).toBeCalledWith({
      protocol: 'delight-rpc'
    , version: '3.1'
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
          , version: '3.1'
          , id: request.id
          , result: request.params[0]
          }
        }
        const message = 'message'

        const client = createClient<IAPI>(send, {
          expectedVersion: '^1.0.0'
        })
        const result = await client.echo(message)

        expect(result).toBe(message)
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
          , version: '3.1'
          , id: request.id
          , error: normalize(new VersionMismatch(errorMessage))
          }
        }
        const message = 'message'

        const client = createClient<IAPI>(send, {
          expectedVersion: '^1.0.0'
        })
        const result = await getErrorPromise(client.echo(message))

        expect(result).toBeInstanceOf(VersionMismatch)
        expect(result!.message).toBe(errorMessage)
      })
    })
  })

  describe('with validators', () => {
    test('pass', async () => {
      interface IAPI {
        namespace: {
          echo(message: string): string
        }
      }
      const send = jest.fn(async function (request: IRequest<unknown>): Promise<IResponse<unknown>> {
        return {
          protocol: 'delight-rpc'
        , version: '3.1'
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
      , version: '3.1'
      , id: expect.any(String)
      , method: ['namespace', 'echo']
      , params: [message]
      })
    })

    test('not pass', () => {
      interface IAPI {
        namespace: {
          echo(message: string): string
        }
      }
      const send = jest.fn(async function (request: IRequest<unknown>): Promise<IResponse<unknown>> {
        return {
          protocol: 'delight-rpc'
        , version: '3.1'
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
      , version: '3.1'
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
    , version: '3.1'
    , id: expect.any(String)
    , method: ['echo']
    , params: [message]
    , channel: 'channel'
    })
  })
})
