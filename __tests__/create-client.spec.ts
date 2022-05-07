import { createClient } from '@src/create-client'
import { getErrorPromise, getError } from 'return-style'
import { IRequest, VersionMismatch, MethodNotAvailable, IClientAdapter } from '@src/types'
import { normalize, CustomError } from '@blackglory/errors'
import { go, pass } from '@blackglory/prelude'
import { mocked } from 'jest-mock'
import { waitForFunction } from '@blackglory/wait-for'
import '@blackglory/jest-matchers'

describe('createClient', () => {
  describe('then method', () => {
    it('return undefined', () => {
      const adapter: IClientAdapter<unknown> = {
        send: jest.fn()
      , listen: jest.fn()
      }

      const [client] = createClient(adapter)

      // @ts-ignore
      expect(client.then).toBeUndefined()
    })
  })

  describe('success', () => {
    it('return result', async () => {
      interface IAPI {
        echo(message: string): string
      }
      const adapter: IClientAdapter<unknown> = {
        send: jest.fn()
      , listen(listener) {
          go(async () => {
            await waitForFunction(() => mocked(adapter.send).mock.lastCall)
            const request = mocked(adapter.send).mock.lastCall![0] as IRequest<unknown>
            listener({
              protocol: 'delight-rpc'
            , version: '2.2'
            , id: request.id
            , result: request.params[0]
            })
          })
          return pass
        }
      }
      const message = 'message'

      const [client] = createClient<IAPI>(adapter)
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
      const adapter: IClientAdapter<unknown> = {
        send: jest.fn()
      , listen(listener) {
          go(async () => {
            await waitForFunction(() => mocked(adapter.send).mock.lastCall)
            const request = mocked(adapter.send).mock.lastCall![0] as IRequest<unknown>
            listener({
              protocol: 'delight-rpc'
            , version: '2.2'
            , id: request.id
            , error: normalize(new UserError(errorMessage))
            })
          })
          return pass
        }
      }
      const message = 'message'

      const [client] = createClient<IAPI>(adapter)
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
      const adapter: IClientAdapter<unknown> = {
        send: jest.fn()
      , listen(listener) {
          go(async () => {
            await waitForFunction(() => mocked(adapter.send).mock.lastCall)
            const request = mocked(adapter.send).mock.lastCall![0] as IRequest<unknown>
            listener({
              protocol: 'delight-rpc'
            , version: '2.2'
            , id: request.id
            , error: normalize(new MethodNotAvailable(errorMessage))
            })
          })
          return pass
        }
      }
      const message = 'message'

      const [client] = createClient<IAPI>(adapter)
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
    const adapter: IClientAdapter<unknown> = {
      send: jest.fn()
    , listen: jest.fn()
    }
    const message = 'message'

    const [client] = createClient<IAPI>(adapter)
    client.namespace.echo(message)

    expect(adapter.send).toBeCalledWith({
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
        const adapter: IClientAdapter<unknown> = {
          send: jest.fn()
        , listen(listener) {
            go(async () => {
              await waitForFunction(() => mocked(adapter.send).mock.lastCall)
              const request = mocked(adapter.send).mock.lastCall![0] as IRequest<unknown>
              listener({
                protocol: 'delight-rpc'
              , version: '2.2'
              , id: request.id
              , result: request.params[0]
              })
            })
            return pass
          }
        }
        const message = 'message'

        const [client] = createClient<IAPI>(adapter, {
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
        const adapter: IClientAdapter<unknown> = {
          send: jest.fn()
        , listen(listener) {
            go(async () => {
              await waitForFunction(() => mocked(adapter.send).mock.lastCall)
              const request = mocked(adapter.send).mock.lastCall![0] as IRequest<unknown>
              listener({
                protocol: 'delight-rpc'
              , version: '2.2'
              , id: request.id
              , error: normalize(new VersionMismatch(errorMessage))
              })
            })
            return pass
          }
        }
        const message = 'message'

        const [client] = createClient<IAPI>(adapter, {
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
      const adapter: IClientAdapter<unknown> = {
        send: jest.fn()
      , listen(listener) {
          go(async () => {
            await waitForFunction(() => mocked(adapter.send).mock.lastCall)
            const request = mocked(adapter.send).mock.lastCall![0] as IRequest<unknown>
            listener({
              protocol: 'delight-rpc'
            , version: '2.2'
            , id: request.id
            , result: request.params[0]
            })
          })
          return pass
        }
      }
      const validator = jest.fn()
      const validators = {
        namespace: {
          echo: validator
        }
      }
      const message = 'message'

      const [client] = createClient<IAPI>(adapter, {
        parameterValidators: validators
      })
      await client.namespace.echo(message)

      expect(validator).toBeCalledWith(message)
      expect(adapter.send).toBeCalledWith({
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
      const adapter: IClientAdapter<unknown> = {
        send: jest.fn()
      , listen(listener) {
          return pass
        }
      }
      const validator = jest.fn(() => {
        throw new Error('custom error')
      })
      const validators = {
        namespace: {
          echo: validator
        }
      }
      const message = 'message'

      const [client] = createClient<IAPI>(adapter, {
        parameterValidators: validators
      })
      const err = getError(() => client.namespace.echo(message))

      expect(validator).toBeCalledWith(message)
      expect(err).toBeInstanceOf(Error)
      expect(err!.message).toBe('custom error')
    })
  })
})
