import { createServer } from '@src/create-server'
import { IServerAdapter, IRequest, IBatchRequest, IBatchResponse, IResultForBatchResponse } from '@src/types'
import { delay } from 'extra-promise'
import { isBatchResponse } from '@utils/is-batch-response'
import { pass } from '@blackglory/prelude'
import { mocked } from 'jest-mock'
import { setTimeout } from 'extra-timers'
import { waitForFunction } from '@blackglory/wait-for'
import '@blackglory/jest-matchers'

const TIME_ERROR = 1

describe('createServer', () => {
  describe('IRequest => IResponse', () => {
    describe('success', () => {
      it('return IResult', async () => {
        const method = jest.fn(async (message: string) => message)
        const api = { echo: method }
        const request: IRequest<unknown> = {
          protocol: 'delight-rpc'
        , version: '2.2'
        , id: 'id'
        , method: ['echo']
        , params: ['message']
        }
        const adapter: IServerAdapter<unknown> = {
          send: jest.fn()
        , listen(listener) {
            setTimeout(100, () => listener(request))
            return pass
          }
        }

        createServer(api, adapter)

        await waitForFunction(() => mocked(adapter.send).mock.lastCall)
        expect(adapter.send).toBeCalledTimes(1)
        expect(adapter.send).toBeCalledWith({
          protocol: 'delight-rpc'
        , version: '2.2'
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
        , version: '2.2'
        , id: 'id'
        , method: ['notFound']
        , params: ['message']
        }
        const adapter: IServerAdapter<unknown> = {
          send: jest.fn()
        , listen(listener) {
            setTimeout(100, () => listener(request))
            return pass
          }
        }

        createServer(api, adapter)

        await waitForFunction(() => mocked(adapter.send).mock.lastCall)
        expect(adapter.send).toBeCalledTimes(1)
        expect(adapter.send).toBeCalledWith({
          protocol: 'delight-rpc'
        , version: '2.2'
        , id: 'id'
        , error: {
            name: 'MethodNotAvailable'
          , message: 'The method is not available.'
          , stack: expect.any(String)
          , ancestors: ['CustomError', 'Error']
          }
        })
      })
    })

    describe('method throws error', () => {
      it('return IError', async () => {
        const method = jest.fn(async () => {
          throw new Error('message')
        })
        const api = { throws: method }
        const request: IRequest<unknown> = {
          protocol: 'delight-rpc'
        , version: '2.2'
        , id: 'id'
        , method: ['throws']
        , params: []
        }
        const adapter: IServerAdapter<unknown> = {
          send: jest.fn()
        , listen(listener) {
            setTimeout(100, () => listener(request))
            return pass
          }
        }

        createServer(api, adapter)

        await waitForFunction(() => mocked(adapter.send).mock.lastCall)
        expect(adapter.send).toBeCalledTimes(1)
        expect(adapter.send).toBeCalledWith({
          protocol: 'delight-rpc'
        , version: '2.2'
        , id: 'id'
        , error: {
            name: 'Error'
          , message: 'message'
          , stack: expect.any(String)
          , ancestors: []
          }
        })
      })
    })

    test('with namespace', async () => {
      const method = jest.fn(async (message: string) => message)
      const api = {
        namespace: { echo: method }
      }
      const request: IRequest<unknown> = {
        protocol: 'delight-rpc'
      , version: '2.2'
      , id: 'id'
      , method: ['namespace', 'echo']
      , params: ['message']
      }
      const adapter: IServerAdapter<unknown> = {
        send: jest.fn()
      , listen(listener) {
          setTimeout(100, () => listener(request))
          return pass
        }
      }

      createServer(api, adapter)

      await waitForFunction(() => mocked(adapter.send).mock.lastCall)
      expect(method).toBeCalledTimes(1)
      expect(adapter.send).toBeCalledTimes(1)
      expect(adapter.send).toBeCalledWith({
        protocol: 'delight-rpc'
      , version: '2.2'
      , id: 'id'
      , result: 'message'
      })
    })

    describe('with expectedVersion', () => {
      describe('match', () => {
        it('return IResult', async () => {
          const method = jest.fn(async (message: string) => message)
          const api = { echo: method }
          const request: IRequest<unknown> = {
            protocol: 'delight-rpc'
          , version: '2.2'
          , expectedVersion: '1.0.0'
          , id: 'id'
          , method: ['echo']
          , params: ['message']
          }
          const adapter: IServerAdapter<unknown> = {
            send: jest.fn()
          , listen(listener) {
              setTimeout(100, () => listener(request))
              return pass
            }
          }

          createServer(api, adapter, {
            version: '1.0.0'
          })

          await waitForFunction(() => mocked(adapter.send).mock.lastCall)
          expect(adapter.send).toBeCalledTimes(1)
          expect(adapter.send).toBeCalledWith({
            protocol: 'delight-rpc'
          , version: '2.2'
          , id: 'id'
          , result: 'message'
          })
        })
      })

      describe('mismatch', () => {
        it('return IError', async () => {
          const method = jest.fn(async (message: string) => message)
          const api = { echo: method }
          const request: IRequest<unknown> = {
            protocol: 'delight-rpc'
          , version: '2.2'
          , expectedVersion: '2.0.0'
          , id: 'id'
          , method: ['echo']
          , params: ['message']
          }
          const adapter: IServerAdapter<unknown> = {
            send: jest.fn()
          , listen(listener) {
              setTimeout(100, () => listener(request))
              return pass
            }
          }

          createServer(api, adapter, {
            version: '1.0.0'
          })

          await waitForFunction(() => mocked(adapter.send).mock.lastCall)
          expect(adapter.send).toBeCalledTimes(1)
          expect(adapter.send).toBeCalledWith({
            protocol: 'delight-rpc'
          , version: '2.2'
          , id: 'id'
          , error: {
              name: 'VersionMismatch'
            , message: 'The expected version is ^2.0.0, but the server version is 1.0.0.'
            , stack: expect.any(String)
            , ancestors: ['CustomError', 'Error']
            }
          })
        })
      })
    })

    describe('with validators', () => {
      it('pass', async () => {
        const method = jest.fn(async (message: string) => message)
        const api = {
          namespace: {
            echo: method
          }
        }
        const request: IRequest<unknown> = {
          protocol: 'delight-rpc'
        , version: '2.2'
        , id: 'id'
        , method: ['namespace', 'echo']
        , params: ['message']
        }
        const validator = jest.fn()
        const validators = {
          namespace: {
            echo: validator
          }
        }
        const adapter: IServerAdapter<unknown> = {
          send: jest.fn()
        , listen(listener) {
            setTimeout(100, () => listener(request))
            return pass
          }
        }

        createServer(api, adapter, {
          parameterValidators: validators
        })

        await waitForFunction(() => mocked(adapter.send).mock.lastCall)
        expect(validator).toBeCalledWith('message')
        expect(adapter.send).toBeCalledTimes(1)
        expect(adapter.send).toBeCalledWith({
          protocol: 'delight-rpc'
        , version: '2.2'
        , id: 'id'
        , result: 'message'
        })
      })

      it('not pass', async () => {
        const method = jest.fn(async (message: string) => message)
        const api = {
          namespace: {
            echo: method
          }
        }
        const request: IRequest<unknown> = {
          protocol: 'delight-rpc'
        , version: '2.2'
        , id: 'id'
        , method: ['namespace', 'echo']
        , params: ['message']
        }
        const customError = new Error('custom error')
        const validator = jest.fn(() => {
          throw customError
        })
        const validators = {
          namespace: {
            echo: validator
          }
        }
        const adapter: IServerAdapter<unknown> = {
          send: jest.fn()
        , listen(listener) {
            setTimeout(100, () => listener(request))
            return pass
          }
        }

        createServer(api, adapter, {
          parameterValidators: validators
        })

        await waitForFunction(() => mocked(adapter.send).mock.lastCall)
        expect(validator).toBeCalledWith('message')
        expect(adapter.send).toBeCalledTimes(1)
        expect(adapter.send).toBeCalledWith({
          protocol: 'delight-rpc'
        , version: '2.2'
        , id: 'id'
        , error: {
            name: 'Error'
          , message: 'custom error'
          , stack: expect.any(String)
          , ancestors: []
          }
        })
      })
    })
  })

  describe('IBatchRequest => IBatchResponse', () => {
    describe('success', () => {
      it('returns IBatchResponse[]', async () => {
        const method1 = jest.fn(async () => {
          throw new Error('message')
        })
        const method2 = jest.fn(async (message: string) => message)
        const api = {
          throws: method1
        , echo: method2
        }
        const request: IBatchRequest<unknown> = {
          protocol: 'delight-rpc'
        , version: '2.2'
        , id: 'id'
        , parallel: false
        , requests: [
            {
              method: ['throws']
            , params: []
            }
          , {
              method: ['echo']
            , params: ['message']
            }
          ]
        }
        const adapter: IServerAdapter<unknown> = {
          send: jest.fn()
        , listen(listener) {
            setTimeout(100, () => listener(request))
            return pass
          }
        }

        createServer(api, adapter)

        await waitForFunction(() => mocked(adapter.send).mock.lastCall)
        expect(adapter.send).toBeCalledTimes(1)
        expect(adapter.send).toBeCalledWith({
          protocol: 'delight-rpc'
        , version: '2.2'
        , id: 'id'
        , responses: [
            {
              error: {
                name: 'Error'
              , message: 'message'
              , stack: expect.any(String)
              , ancestors: []
              }
            }
          , {
              result: 'message'
            }
          ]
        })
      })
    })

    describe('method not available', () => {
      it('return IBatchResponse[]', async () => {
        const api = {}
        const request: IBatchRequest<unknown> = {
          protocol: 'delight-rpc'
        , version: '2.2'
        , id: 'id'
        , parallel: false
        , requests: [
            {
              method: ['notFound']
            , params: ['message']
            }
          ]
        }
        const adapter: IServerAdapter<unknown> = {
          send: jest.fn()
        , listen(listener) {
            setTimeout(100, () => listener(request))
            return pass
          }
        }

        createServer(api, adapter)

        await waitForFunction(() => mocked(adapter.send).mock.lastCall)
        expect(adapter.send).toBeCalledTimes(1)
        expect(adapter.send).toBeCalledWith({
          protocol: 'delight-rpc'
        , version: '2.2'
        , id: 'id'
        , responses: [
            {
              error: {
                name: 'MethodNotAvailable'
              , message: 'The method is not available.'
              , stack: expect.any(String)
              , ancestors: ['CustomError', 'Error']
              }
            }
          ]
        })
      })
    })

    describe('parallel', () => {
      test('parallel = true', async () => {
        const method1 = jest.fn(async () => {
          const timestamp = Date.now()
          await delay(1000)
          return timestamp
        })
        const method2 = jest.fn(async () => {
          return Date.now()
        })
        const api = { method1, method2 }
        const request: IBatchRequest<unknown> = {
          protocol: 'delight-rpc'
        , version: '2.2'
        , expectedVersion: '1.0.0'
        , id: 'id'
        , parallel: true
        , requests: [
            {
              method: ['method1']
            , params: []
            }
          , {
              method: ['method2']
            , params: []
            }
          ]
        }
        const adapter: IServerAdapter<unknown> = {
          send: jest.fn()
        , listen(listener) {
            setTimeout(100, () => listener(request))
            return pass
          }
        }

        createServer(api, adapter, {
          version: '1.0.0'
        })

        await waitForFunction(() => mocked(adapter.send).mock.lastCall)
        expect(adapter.send).toBeCalledTimes(1)
        expect(adapter.send).toBeCalledWith({
          protocol: 'delight-rpc'
        , version: '2.2'
        , id: 'id'
        , responses: [
            { result: expect.any(Number) }
          , { result: expect.any(Number) }
          ]
        })
        expect(method1).toBeCalled()
        expect(method2).toBeCalled()
        const response = mocked(adapter.send).mock.lastCall![0] as IBatchResponse<unknown>
        expect(isBatchResponse(response)).toBe(true)
        const result1 = response.responses[0] as IResultForBatchResponse<number>
        const result2 = response.responses[1] as IResultForBatchResponse<number>
        expect(result1.result).toEqual(expect.any(Number))
        expect(result2.result).toEqual(expect.any(Number))
        expect(result2.result - result1.result).toBeLessThan(1000)
      })

      test('parallel = false', async () => {
        const method1 = jest.fn(async () => {
          const timestamp = Date.now()
          await delay(1000)
          return timestamp
        })
        const method2 = jest.fn(async () => {
          return Date.now()
        })
        const api = { method1, method2 }
        const request: IBatchRequest<unknown> = {
          protocol: 'delight-rpc'
        , version: '2.2'
        , expectedVersion: '1.0.0'
        , id: 'id'
        , parallel: false
        , requests: [
            {
              method: ['method1']
            , params: []
            }
          , {
              method: ['method2']
            , params: []
            }
          ]
        }
        const adapter: IServerAdapter<unknown> = {
          send: jest.fn()
        , listen(listener) {
            setTimeout(100, () => listener(request))
            return pass
          }
        }

        createServer(api, adapter, {
          version: '1.0.0'
        })

        await waitForFunction(() => mocked(adapter.send).mock.lastCall)
        expect(adapter.send).toBeCalledTimes(1)
        expect(adapter.send).toBeCalledWith({
          protocol: 'delight-rpc'
        , version: '2.2'
        , id: 'id'
        , responses: [
            { result: expect.any(Number) }
          , { result: expect.any(Number) }
          ]
        })
        expect(method1).toBeCalled()
        expect(method2).toBeCalled()
        const response = mocked(adapter.send).mock.lastCall![0] as IBatchResponse<unknown>
        expect(isBatchResponse(response)).toBe(true)
        const result1 = response.responses[0] as IResultForBatchResponse<number>
        const result2 = response.responses[1] as IResultForBatchResponse<number>
        expect(result1.result).toEqual(expect.any(Number))
        expect(result2.result).toEqual(expect.any(Number))
        expect(result2.result - result1.result).toBeGreaterThanOrEqual(1000 - TIME_ERROR)
      })
    })

    test('with namespace', async () => {
      const method = jest.fn(async (message: string) => message)
      const api = {
        namespace: { echo: method }
      }
      const request: IBatchRequest<unknown> = {
        protocol: 'delight-rpc'
      , version: '2.2'
      , id: 'id'
      , parallel: false
      , requests: [
          {
            method: ['namespace', 'echo']
          , params: ['message']
          }
        ]
      }
      const adapter: IServerAdapter<unknown> = {
        send: jest.fn()
      , listen(listener) {
          setTimeout(100, () => listener(request))
          return pass
        }
      }

      createServer(api, adapter)

      await waitForFunction(() => mocked(adapter.send).mock.lastCall)
      expect(method).toBeCalledTimes(1)
      expect(adapter.send).toBeCalledTimes(1)
      expect(adapter.send).toBeCalledWith({
        protocol: 'delight-rpc'
      , version: '2.2'
      , id: 'id'
      , responses: [
          { result: 'message' }
        ]
      })
    })

    describe('with expectedVersion', () => {
      describe('match', () => {
        it('returns IBatchResponse', async () => {
          const method = jest.fn(async (message: string) => message)
          const api = { echo: method }
          const request: IBatchRequest<unknown> = {
            protocol: 'delight-rpc'
          , version: '2.2'
          , expectedVersion: '1.0.0'
          , id: 'id'
          , parallel: false
          , requests: [
              {
                method: ['echo']
              , params: ['message']
              }
            ]
          }
          const adapter: IServerAdapter<unknown> = {
            send: jest.fn()
          , listen(listener) {
              setTimeout(100, () => listener(request))
              return pass
            }
          }

          createServer(api, adapter, {
            version: '1.0.0'
          })

          await waitForFunction(() => mocked(adapter.send).mock.lastCall)
          expect(adapter.send).toBeCalledTimes(1)
          expect(adapter.send).toBeCalledWith({
            protocol: 'delight-rpc'
          , version: '2.2'
          , id: 'id'
          , responses: [
              { result: 'message' }
            ]
          })
        })
      })

      describe('mismatch', () => {
        it('returns IError', async () => {
          const method = jest.fn(async (message: string) => message)
          const api = { echo: method }
          const request: IBatchRequest<unknown> = {
            protocol: 'delight-rpc'
          , version: '2.2'
          , expectedVersion: '2.0.0'
          , id: 'id'
          , parallel: false
          , requests: [
              {
                method: ['echo']
              , params: ['message']
              }
            ]
          }
          const adapter: IServerAdapter<unknown> = {
            send: jest.fn()
          , listen(listener) {
              setTimeout(100, () => listener(request))
              return pass
            }
          }

          createServer(api, adapter, { 
            version: '1.0.0'
          })

          await waitForFunction(() => mocked(adapter.send).mock.lastCall)
          expect(adapter.send).toBeCalledTimes(1)
          expect(adapter.send).toBeCalledWith({
            protocol: 'delight-rpc'
          , version: '2.2'
          , id: 'id'
          , error: {
              name: 'VersionMismatch'
            , message: 'The expected version is ^2.0.0, but the server version is 1.0.0.'
            , stack: expect.any(String)
            , ancestors: ['CustomError', 'Error']
            }
          })
        })
      })
    })

    describe('with validators', () => {
      it('pass', async () => {
        const method = jest.fn(async (message: string) => message)
        const api = {
          namespace: {
            echo: method
          }
        }
        const request: IBatchRequest<unknown> = {
          protocol: 'delight-rpc'
        , version: '2.2'
        , id: 'id'
        , parallel: false
        , requests: [
            {
              method: ['namespace', 'echo']
            , params: ['message']
            }
          ]
        }
        const validator = jest.fn()
        const validators = {
          namespace: {
            echo: validator
          }
        }
        const adapter: IServerAdapter<unknown> = {
          send: jest.fn()
        , listen(listener) {
            setTimeout(100, () => listener(request))
            return pass
          }
        }

        createServer(api, adapter, {
          parameterValidators: validators
        })

        await waitForFunction(() => mocked(adapter.send).mock.lastCall)
        expect(validator).toBeCalledWith('message')
        expect(adapter.send).toBeCalledTimes(1)
        expect(adapter.send).toBeCalledWith({
          protocol: 'delight-rpc'
        , version: '2.2'
        , id: 'id'
        , responses: [
            { result: 'message' }
          ]
        })
      })

      it('not pass', async () => {
        const method = jest.fn(async (message: string) => message)
        const api = {
          namespace: {
            echo: method
          }
        }
        const request: IBatchRequest<unknown> = {
          protocol: 'delight-rpc'
        , version: '2.2'
        , id: 'id'
        , parallel: false
        , requests: [
            {
              method: ['namespace', 'echo']
            , params: ['message']
            }
          ]
        }
        const customError = new Error('custom error')
        const validator = jest.fn(() => {
          throw customError
        })
        const validators = {
          namespace: {
            echo: validator
          }
        }
        const adapter: IServerAdapter<unknown> = {
          send: jest.fn()
        , listen(listener) {
            setTimeout(100, () => listener(request))
            return pass
          }
        }

        createServer(api, adapter, {
          parameterValidators: validators
        })

        await waitForFunction(() => mocked(adapter.send).mock.lastCall)
        expect(validator).toBeCalledWith('message')
        expect(adapter.send).toBeCalledTimes(1)
        expect(adapter.send).toBeCalledWith({
          protocol: 'delight-rpc'
        , version: '2.2'
        , id: 'id'
        , responses: [
            {
              error: {
                name: 'Error'
              , message: 'custom error'
              , stack: expect.any(String)
              , ancestors: []
              }
            }
          ]
        })
      })
    })
  })
})
