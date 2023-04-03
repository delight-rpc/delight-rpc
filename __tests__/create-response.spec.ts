import { createResponse } from '@src/create-response.js'
import { AnyChannel } from '@src/types.js'
import { IRequest, IBatchRequest, IBatchResponse, IResultForBatchResponse } from '@delight-rpc/protocol'
import { delay } from 'extra-promise'
import { isBatchResponse } from '@utils/is-batch-response.js'
import { AbortController } from 'extra-abort'

const TIME_ERROR = 1

describe('createResponse', () => {
  describe('IRequest => IResponse', () => {
    test('success', async () => {
      const method = vi.fn(async (message: string) => message)
      const api = { echo: method }
      const request: IRequest<unknown> = {
        protocol: 'delight-rpc'
      , version: '3.1'
      , id: 'id'
      , method: ['echo']
      , params: ['message']
      }

      const result = await createResponse(api, request)

      expect(result).toStrictEqual({
        protocol: 'delight-rpc'
      , version: '3.1'
      , id: 'id'
      , result: 'message'
      })
    })

    test('method not available', async () => {
      const api = {}
      const request: IRequest<unknown> = {
        protocol: 'delight-rpc'
      , version: '3.1'
      , id: 'id'
      , method: ['notFound']
      , params: ['message']
      }

      const result = await createResponse(api, request)

      expect(result).toStrictEqual({
        protocol: 'delight-rpc'
      , version: '3.1'
      , id: 'id'
      , error: {
          name: 'MethodNotAvailable'
        , message: 'The method is not available.'
        , stack: expect.any(String)
        , ancestors: ['CustomError', 'Error']
        }
      })
    })

    test('method throws error', async () => {
      const method = vi.fn(async () => {
        throw new Error('message')
      })
      const api = { throws: method }
      const request: IRequest<unknown> = {
        protocol: 'delight-rpc'
      , version: '3.1'
      , id: 'id'
      , method: ['throws']
      , params: []
      }

      const result = await createResponse(api, request)

      expect(result).toStrictEqual({
        protocol: 'delight-rpc'
      , version: '3.1'
      , id: 'id'
      , error: {
          name: 'Error'
        , message: 'message'
        , stack: expect.any(String)
        , ancestors: []
        }
      })
    })

    test('with namespace', async () => {
      const method = vi.fn(async (message: string) => message)
      const api = {
        namespace: { echo: method }
      }
      const request: IRequest<unknown> = {
        protocol: 'delight-rpc'
      , version: '3.1'
      , id: 'id'
      , method: ['namespace', 'echo']
      , params: ['message']
      }

      const result = await createResponse(api, request)

      expect(method).toBeCalledTimes(1)
      expect(result).toStrictEqual({
        protocol: 'delight-rpc'
      , version: '3.1'
      , id: 'id'
      , result: 'message'
      })
    })

    describe('with expectedVersion', () => {
      test('match', async () => {
        const method = vi.fn(async (message: string) => message)
        const api = { echo: method }
        const request: IRequest<unknown> = {
          protocol: 'delight-rpc'
        , version: '3.1'
        , expectedVersion: '^1.0.0'
        , id: 'id'
        , method: ['echo']
        , params: ['message']
        }

        const result = await createResponse(api, request, {
          version: '1.0.0'
        })

        expect(result).toStrictEqual({
          protocol: 'delight-rpc'
        , version: '3.1'
        , id: 'id'
        , result: 'message'
        })
      })

      test('mismatch', async () => {
        const method = vi.fn(async (message: string) => message)
        const api = { echo: method }
        const request: IRequest<unknown> = {
          protocol: 'delight-rpc'
        , version: '3.1'
        , expectedVersion: '^2.0.0'
        , id: 'id'
        , method: ['echo']
        , params: ['message']
        }

        const result = await createResponse(api, request, {
          version: '1.0.0'
        })

        expect(result).toMatchObject({
          protocol: 'delight-rpc'
        , version: '3.1'
        , id: 'id'
        , error: {
            name: 'VersionMismatch'
          , message: 'The expected version is "^2.0.0", but the server version is "1.0.0".'
          , stack: expect.any(String)
          , ancestors: ['CustomError', 'Error']
          }
        })
      })
    })

    describe('with validators', () => {
      test('pass', async () => {
        const method = vi.fn(async (message: string) => message)
        const api = {
          namespace: {
            echo: method
          }
        }
        const request: IRequest<unknown> = {
          protocol: 'delight-rpc'
        , version: '3.1'
        , id: 'id'
        , method: ['namespace', 'echo']
        , params: ['message']
        }
        const validator = vi.fn()
        const validators = {
          namespace: {
            echo: validator
          }
        }

        const result = await createResponse(api, request, {
          parameterValidators: validators
        })

        expect(validator).toBeCalledWith('message')
        expect(result).toStrictEqual({
          protocol: 'delight-rpc'
        , version: '3.1'
        , id: 'id'
        , result: 'message'
        })
      })

      test('not pass', async () => {
        const method = vi.fn(async (message: string) => message)
        const api = {
          namespace: {
            echo: method
          }
        }
        const request: IRequest<unknown> = {
          protocol: 'delight-rpc'
        , version: '3.1'
        , id: 'id'
        , method: ['namespace', 'echo']
        , params: ['message']
        }
        const customError = new Error('custom error')
        const validator = vi.fn(() => {
          throw customError
        })
        const validators = {
          namespace: {
            echo: validator
          }
        }

        const result = await createResponse(api, request, {
          parameterValidators: validators
        })

        expect(validator).toBeCalledWith('message')
        expect(result).toStrictEqual({
          protocol: 'delight-rpc'
        , version: '3.1'
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

    describe('with channel', () => {
      test('no channel', async () => {
        const method = vi.fn(async (message: string) => message)
        const api = { echo: method }
        const request: IRequest<unknown> = {
          protocol: 'delight-rpc'
        , version: '3.1'
        , id: 'id'
        , method: ['echo']
        , params: ['message']
        , channel: 'channel'
        }

        const result = await createResponse(api, request)

        expect(result).toBeNull()
      })

      describe('channel is AnyChannel', () => {
        test('request.channel', async () => {
          const method = vi.fn(async (message: string) => message)
          const api = { echo: method }
          const request: IRequest<unknown> = {
            protocol: 'delight-rpc'
          , version: '3.1'
          , id: 'id'
          , method: ['echo']
          , params: ['message']
          , channel: 'channel'
          }

          const result = await createResponse(api, request, {
            channel: AnyChannel
          })

          expect(result).toStrictEqual({
            protocol: 'delight-rpc'
          , version: '3.1'
          , id: 'id'
          , result: 'message'
          , channel: 'channel'
          })
        })

        test('no request.channel', async () => {
          const method = vi.fn(async (message: string) => message)
          const api = { echo: method }
          const request: IRequest<unknown> = {
            protocol: 'delight-rpc'
          , version: '3.1'
          , id: 'id'
          , method: ['echo']
          , params: ['message']
          }

          const result = await createResponse(api, request, {
            channel: AnyChannel
          })

          expect(result).toStrictEqual({
            protocol: 'delight-rpc'
          , version: '3.1'
          , id: 'id'
          , result: 'message'
          })
        })
      })

      describe('channel is a string', () => {
        test('same request.channel', async () => {
          const method = vi.fn(async (message: string) => message)
          const api = { echo: method }
          const request: IRequest<unknown> = {
            protocol: 'delight-rpc'
          , version: '3.1'
          , id: 'id'
          , method: ['echo']
          , params: ['message']
          , channel: 'channel'
          }

          const result = await createResponse(api, request, {
            channel: 'channel'
          })

          expect(result).toStrictEqual({
            protocol: 'delight-rpc'
          , version: '3.1'
          , id: 'id'
          , result: 'message'
          , channel: 'channel'
          })
        })

        test('diff request.channel', async () => {
          const method = vi.fn(async (message: string) => message)
          const api = { echo: method }
          const request: IRequest<unknown> = {
            protocol: 'delight-rpc'
          , version: '3.1'
          , id: 'id'
          , method: ['echo']
          , params: ['message']
          , channel: 'channel'
          }

          const result = await createResponse(api, request, {
            channel: 'diff-channel'
          })

          expect(result).toBeNull()
        })

        test('no request.channel', async () => {
          const method = vi.fn(async (message: string) => message)
          const api = { echo: method }
          const request: IRequest<unknown> = {
            protocol: 'delight-rpc'
          , version: '3.1'
          , id: 'id'
          , method: ['echo']
          , params: ['message']
          }

          const result = await createResponse(api, request, {
            channel: 'channel'
          })

          expect(result).toBeNull()
        })
      })

      describe('channel is a regexp', () => {
        test('request.channel is matched', async () => {
          const method = vi.fn(async (message: string) => message)
          const api = { echo: method }
          const request: IRequest<unknown> = {
            protocol: 'delight-rpc'
          , version: '3.1'
          , id: 'id'
          , method: ['echo']
          , params: ['message']
          , channel: 'channel'
          }

          const result = await createResponse(api, request, {
            channel: /^channel$/
          })

          expect(result).toStrictEqual({
            protocol: 'delight-rpc'
          , version: '3.1'
          , id: 'id'
          , result: 'message'
          , channel: 'channel'
          })
        })

        test('request.channel is not matched', async () => {
          const method = vi.fn(async (message: string) => message)
          const api = { echo: method }
          const request: IRequest<unknown> = {
            protocol: 'delight-rpc'
          , version: '3.1'
          , id: 'id'
          , method: ['echo']
          , params: ['message']
          , channel: 'channel'
          }

          const result = await createResponse(api, request, {
            channel: /^diff-channel$/
          })

          expect(result).toBeNull()
        })

        test('no request.channel', async () => {
          const method = vi.fn(async (message: string) => message)
          const api = { echo: method }
          const request: IRequest<unknown> = {
            protocol: 'delight-rpc'
          , version: '3.1'
          , id: 'id'
          , method: ['echo']
          , params: ['message']
          }

          const result = await createResponse(api, request, {
            channel: /^channel$/
          })

          expect(result).toBeNull()
        })
      })
    })

    describe('with ownPropsOnly', () => {
      test('own prop', async () => {
        const method = vi.fn(async (message: string) => message)
        const api = {
          namespace: {
            echo: method
          }
        }
        const request: IRequest<unknown> = {
          protocol: 'delight-rpc'
        , version: '3.1'
        , id: 'id'
        , method: ['namespace', 'echo']
        , params: ['message']
        }

        const result = await createResponse(api, request, {
           ownPropsOnly: true
        })

        expect(result).toStrictEqual({
          protocol: 'delight-rpc'
        , version: '3.1'
        , id: 'id'
        , result: 'message'
        })
      })

      test('non-own prop', async () => {
        const method = vi.fn(async (message: string) => message)
        const api = Object.create({
          namespace: {
            echo: method
          }
        })
        const request: IRequest<unknown> = {
          protocol: 'delight-rpc'
        , version: '3.1'
        , id: 'id'
        , method: ['namespace', 'echo']
        , params: ['message']
        }

        const result = await createResponse(api, request, {
           ownPropsOnly: true
        })

        expect(result).toStrictEqual({
          protocol: 'delight-rpc'
        , version: '3.1'
        , id: 'id'
        , error: {
            name: 'MethodNotAvailable'
          , stack: expect.any(String)
          , ancestors: ['CustomError', 'Error']
          , message: 'The method is not available.'
          }
        })
      })
    })

    describe('with signal', () => {
      test('signal is aborted', async () => {
        const method = vi.fn(async (message: string) => message)
        const api = { echo: method }
        const request: IRequest<unknown> = {
          protocol: 'delight-rpc'
        , version: '3.1'
        , id: 'id'
        , method: ['echo']
        , params: ['message']
        }
        const controller = new AbortController()
        controller.abort()

        const result = await createResponse(api, request, {
          signal: controller.signal
        })

        expect(result).toStrictEqual({
          protocol: 'delight-rpc'
        , version: '3.1'
        , id: 'id'
        , error: {
            name: 'DOMException'
          , ancestors: ['Error']
          , message: expect.any(String)
          , stack: expect.any(String)
          }
        })
      })

      test('signal isnt aborted', async () => {
        const method = vi.fn(async (message: string) => message)
        const api = { echo: method }
        const request: IRequest<unknown> = {
          protocol: 'delight-rpc'
        , version: '3.1'
        , id: 'id'
        , method: ['echo']
        , params: ['message']
        }
        const controller = new AbortController()

        const result = await createResponse(api, request, {
          signal: controller.signal
        })

        expect(result).toStrictEqual({
          protocol: 'delight-rpc'
        , version: '3.1'
        , id: 'id'
        , result: 'message'
        })
      })
    })
  })

  describe('IBatchRequest => IBatchResponse', () => {
    test('success', async () => {
      const method1 = vi.fn(async () => {
        throw new Error('message')
      })
      const method2 = vi.fn(async (message: string) => message)
      const api = {
        throws: method1
      , echo: method2
      }
      const request: IBatchRequest<unknown> = {
        protocol: 'delight-rpc'
      , version: '3.1'
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

      const result = await createResponse(api, request)

      expect(result).toStrictEqual({
        protocol: 'delight-rpc'
      , version: '3.1'
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

    test('method not available', async () => {
      const api = {}
      const request: IBatchRequest<unknown> = {
        protocol: 'delight-rpc'
      , version: '3.1'
      , id: 'id'
      , parallel: false
      , requests: [
          {
            method: ['notFound']
          , params: ['message']
          }
        ]
      }

      const result = await createResponse(api, request)

      expect(result).toStrictEqual({
        protocol: 'delight-rpc'
      , version: '3.1'
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

    describe('parallel', () => {
      test('parallel = true', async () => {
        const method1 = vi.fn(async () => {
          const timestamp = Date.now()
          await delay(1000)
          return timestamp
        })
        const method2 = vi.fn(async () => {
          return Date.now()
        })
        const api = { method1, method2 }
        const request: IBatchRequest<unknown> = {
          protocol: 'delight-rpc'
        , version: '3.1'
        , expectedVersion: '^1.0.0'
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

        const result = await createResponse(api, request, {
          version: '1.0.0'
        })

        expect(result).toStrictEqual({
          protocol: 'delight-rpc'
        , version: '3.1'
        , id: 'id'
        , responses: [
            { result: expect.any(Number) }
          , { result: expect.any(Number) }
          ]
        })
        expect(method1).toBeCalled()
        expect(method2).toBeCalled()
        expect(isBatchResponse(result)).toBe(true)
        const response = result as IBatchResponse<unknown>
        const result1 = response.responses[0] as IResultForBatchResponse<number>
        const result2 = response.responses[1] as IResultForBatchResponse<number>
        expect(result1.result).toEqual(expect.any(Number))
        expect(result2.result).toEqual(expect.any(Number))
        expect(result2.result - result1.result).toBeLessThan(1000)
      })

      test('parallel = false', async () => {
        const method1 = vi.fn(async () => {
          const timestamp = Date.now()
          await delay(1000)
          return timestamp
        })
        const method2 = vi.fn(async () => {
          return Date.now()
        })
        const api = { method1, method2 }
        const request: IBatchRequest<unknown> = {
          protocol: 'delight-rpc'
        , version: '3.1'
        , expectedVersion: '^1.0.0'
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

        const result = await createResponse(api, request, {
          version: '1.0.0'
        })

        expect(result).toStrictEqual({
          protocol: 'delight-rpc'
        , version: '3.1'
        , id: 'id'
        , responses: [
            { result: expect.any(Number) }
          , { result: expect.any(Number) }
          ]
        })
        expect(method1).toBeCalled()
        expect(method2).toBeCalled()
        expect(isBatchResponse(result)).toBe(true)
        const response = result as IBatchResponse<unknown>
        const result1 = response.responses[0] as IResultForBatchResponse<number>
        const result2 = response.responses[1] as IResultForBatchResponse<number>
        expect(result1.result).toEqual(expect.any(Number))
        expect(result2.result).toEqual(expect.any(Number))
        expect(result2.result - result1.result).toBeGreaterThanOrEqual(1000 - TIME_ERROR)
      })
    })

    test('with namespace', async () => {
      const method = vi.fn(async (message: string) => message)
      const api = {
        namespace: { echo: method }
      }
      const request: IBatchRequest<unknown> = {
        protocol: 'delight-rpc'
      , version: '3.1'
      , id: 'id'
      , parallel: false
      , requests: [
          {
            method: ['namespace', 'echo']
          , params: ['message']
          }
        ]
      }

      const result = await createResponse(api, request)

      expect(method).toBeCalledTimes(1)
      expect(result).toStrictEqual({
        protocol: 'delight-rpc'
      , version: '3.1'
      , id: 'id'
      , responses: [
          { result: 'message' }
        ]
      })
    })

    describe('with expectedVersion', () => {
      test('match', async () => {
        const method = vi.fn(async (message: string) => message)
        const api = { echo: method }
        const request: IBatchRequest<unknown> = {
          protocol: 'delight-rpc'
        , version: '3.1'
        , expectedVersion: '^1.0.0'
        , id: 'id'
        , parallel: false
        , requests: [
            {
              method: ['echo']
            , params: ['message']
            }
          ]
        }

        const result = await createResponse(api, request, {
          parameterValidators: '1.0.0'
        })

        expect(result).toStrictEqual({
          protocol: 'delight-rpc'
        , version: '3.1'
        , id: 'id'
        , responses: [
            { result: 'message' }
          ]
        })
      })

      test('mismatch', async () => {
        const method = vi.fn(async (message: string) => message)
        const api = { echo: method }
        const request: IBatchRequest<unknown> = {
          protocol: 'delight-rpc'
        , version: '3.1'
        , expectedVersion: '^2.0.0'
        , id: 'id'
        , parallel: false
        , requests: [
            {
              method: ['echo']
            , params: ['message']
            }
          ]
        }

        const result = await createResponse(api, request, {
          version: '1.0.0'
        })

        expect(result).toStrictEqual({
          protocol: 'delight-rpc'
        , version: '3.1'
        , id: 'id'
        , error: {
            name: 'VersionMismatch'
          , message: 'The expected version is "^2.0.0", but the server version is "1.0.0".'
          , stack: expect.any(String)
          , ancestors: ['CustomError', 'Error']
          }
        })
      })
    })

    describe('with validators', () => {
      test('pass', async () => {
        const method = vi.fn(async (message: string) => message)
        const api = {
          namespace: {
            echo: method
          }
        }
        const request: IBatchRequest<unknown> = {
          protocol: 'delight-rpc'
        , version: '3.1'
        , id: 'id'
        , parallel: false
        , requests: [
            {
              method: ['namespace', 'echo']
            , params: ['message']
            }
          ]
        }
        const validator = vi.fn()
        const validators = {
          namespace: {
            echo: validator
          }
        }

        const result = await createResponse(api, request, {
          parameterValidators: validators
        })

        expect(validator).toBeCalledWith('message')
        expect(result).toStrictEqual({
          protocol: 'delight-rpc'
        , version: '3.1'
        , id: 'id'
        , responses: [
            { result: 'message' }
          ]
        })
      })

      test('not pass', async () => {
        const method = vi.fn(async (message: string) => message)
        const api = {
          namespace: {
            echo: method
          }
        }
        const request: IBatchRequest<unknown> = {
          protocol: 'delight-rpc'
        , version: '3.1'
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
        const validator = vi.fn(() => {
          throw customError
        })
        const validators = {
          namespace: {
            echo: validator
          }
        }

        const result = await createResponse(api, request, {
          parameterValidators: validators
        })

        expect(validator).toBeCalledWith('message')
        expect(result).toStrictEqual({
          protocol: 'delight-rpc'
        , version: '3.1'
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

    describe('with channel', () => {
      test('no channel', async () => {
          const method = vi.fn(async (message: string) => message)
          const api = { echo: method }
          const request: IBatchRequest<unknown> = {
            protocol: 'delight-rpc'
          , version: '3.1'
          , id: 'id'
          , parallel: false
          , requests: [
              {
                method: ['echo']
              , params: ['message']
              }
            ]
          , channel: 'channel'
          }

          const result = await createResponse(api, request)

          expect(result).toBeNull()
      })

      describe('channel is AnyChannel', () => {
        test('request.channel', async () => {
          const method = vi.fn(async (message: string) => message)
          const api = { echo: method }
          const request: IBatchRequest<unknown> = {
            protocol: 'delight-rpc'
          , version: '3.1'
          , id: 'id'
          , parallel: false
          , requests: [
              {
                method: ['echo']
              , params: ['message']
              }
            ]
          , channel: 'channel'
          }

          const result = await createResponse(api, request, {
            channel: AnyChannel
          })

          expect(result).toStrictEqual({
            protocol: 'delight-rpc'
          , version: '3.1'
          , id: 'id'
          , responses: [
              {
                result: 'message'
              }
            ]
          , channel: 'channel'
          })
        })

        test('no request.channel', async () => {
          const method = vi.fn(async (message: string) => message)
          const api = { echo: method }
          const request: IBatchRequest<unknown> = {
            protocol: 'delight-rpc'
          , version: '3.1'
          , id: 'id'
          , parallel: false
          , requests: [
              {
                method: ['echo']
              , params: ['message']
              }
            ]
          }

          const result = await createResponse(api, request, {
            channel: AnyChannel
          })

          expect(result).toStrictEqual({
            protocol: 'delight-rpc'
          , version: '3.1'
          , id: 'id'
          , responses: [
              {
                result: 'message'
              }
            ]
          })
        })
      })

      describe('channel is a string', () => {
        test('same request.channel', async () => {
          const method = vi.fn(async (message: string) => message)
          const api = { echo: method }
          const request: IBatchRequest<unknown> = {
            protocol: 'delight-rpc'
          , version: '3.1'
          , id: 'id'
          , parallel: false
          , requests: [
              {
                method: ['echo']
              , params: ['message']
              }
            ]
          , channel: 'channel'
          }

          const result = await createResponse(api, request, {
            channel: 'channel'
          })

          expect(result).toStrictEqual({
            protocol: 'delight-rpc'
          , version: '3.1'
          , id: 'id'
          , responses: [
              {
                result: 'message'
              }
            ]
          , channel: 'channel'
          })
        })

        test('diff request.channel', async () => {
          const method = vi.fn(async (message: string) => message)
          const api = { echo: method }
          const request: IBatchRequest<unknown> = {
            protocol: 'delight-rpc'
          , version: '3.1'
          , id: 'id'
          , parallel: false
          , requests: [
              {
                method: ['echo']
              , params: ['message']
              }
            ]
          , channel: 'channel'
          }

          const result = await createResponse(api, request, {
            channel: 'diff-channel'
          })

          expect(result).toBeNull()
        })

        test('no request.channel', async () => {
          const method = vi.fn(async (message: string) => message)
          const api = { echo: method }
          const request: IBatchRequest<unknown> = {
            protocol: 'delight-rpc'
          , version: '3.1'
          , id: 'id'
          , parallel: false
          , requests: [
              {
                method: ['echo']
              , params: ['message']
              }
            ]
          }

          const result = await createResponse(api, request, {
            channel: 'channel'
          })

          expect(result).toBeNull()
        })
      })

      describe('channel is a regexp', () => {
        test('request.channel is matched', async () => {
          const method = vi.fn(async (message: string) => message)
          const api = { echo: method }
          const request: IBatchRequest<unknown> = {
            protocol: 'delight-rpc'
          , version: '3.1'
          , id: 'id'
          , parallel: false
          , requests: [
              {
                method: ['echo']
              , params: ['message']
              }
            ]
          , channel: 'channel'
          }

          const result = await createResponse(api, request, {
            channel: /^channel$/
          })

          expect(result).toStrictEqual({
            protocol: 'delight-rpc'
          , version: '3.1'
          , id: 'id'
          , responses: [
              {
                result: 'message'
              }
            ]
          , channel: 'channel'
          })
        })

        test('request.channel is not matched', async () => {
          const method = vi.fn(async (message: string) => message)
          const api = { echo: method }
          const request: IBatchRequest<unknown> = {
            protocol: 'delight-rpc'
          , version: '3.1'
          , id: 'id'
          , parallel: false
          , requests: [
              {
                method: ['echo']
              , params: ['message']
              }
            ]
          , channel: 'channel'
          }

          const result = await createResponse(api, request, {
            channel: /^diff-channel$/
          })

          expect(result).toBeNull()
        })

        test('no request.channel', async () => {
          const method = vi.fn(async (message: string) => message)
          const api = { echo: method }
          const request: IBatchRequest<unknown> = {
            protocol: 'delight-rpc'
          , version: '3.1'
          , id: 'id'
          , parallel: false
          , requests: [
              {
                method: ['echo']
              , params: ['message']
              }
            ]
          }

          const result = await createResponse(api, request, {
            channel: /^channel$/
          })

          expect(result).toBeNull()
        })
      })
    })

    describe('with ownPropsOnly', () => {
      test('own prop', async () => {
        const method = vi.fn(async (message: string) => message)
        const api = {
          namespace: {
            echo: method
          }
        }
        const request: IBatchRequest<unknown> = {
          protocol: 'delight-rpc'
        , version: '3.1'
        , id: 'id'
        , parallel: false
        , requests: [
            {
              method: ['namespace', 'echo']
            , params: ['message']
            }
          ]
        }

        const result = await createResponse(api, request, {
          ownPropsOnly: true
        })

        expect(result).toStrictEqual({
          protocol: 'delight-rpc'
        , version: '3.1'
        , id: 'id'
        , responses: [
            {
              result: 'message'
            }
          ]
        })
      })

      test('non-own prop', async () => {
        const method = vi.fn(async (message: string) => message)
        const api = Object.create({
          namespace: {
            echo: method
          }
        })
        const request: IBatchRequest<unknown> = {
          protocol: 'delight-rpc'
        , version: '3.1'
        , id: 'id'
        , parallel: false
        , requests: [
            {
              method: ['namespace', 'echo']
            , params: ['message']
            }
          ]
        }

        const result = await createResponse(api, request, {
          ownPropsOnly: true
        })

        expect(result).toStrictEqual({
          protocol: 'delight-rpc'
        , version: '3.1'
        , id: 'id'
        , responses: [
            {
              error: {
                name: 'MethodNotAvailable'
              , stack: expect.any(String)
              , ancestors: ['CustomError', 'Error']
              , message: 'The method is not available.'
              }
            }
          ]
        })
      })
    })

    describe('with signal', () => {
      test('signal is aborted', async () => {
        const method1 = vi.fn(async () => {
          throw new Error('message')
        })
        const method2 = vi.fn(async (message: string) => message)
        const api = {
          throws: method1
        , echo: method2
        }
        const request: IBatchRequest<unknown> = {
          protocol: 'delight-rpc'
        , version: '3.1'
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
        const controller = new AbortController()
        controller.abort()

        const result = await createResponse(api, request, {
          signal: controller.signal
        })

        expect(result).toStrictEqual({
          protocol: 'delight-rpc'
        , version: '3.1'
        , id: 'id'
        , responses: [
            {
              error: {
                name: 'DOMException'
              , ancestors: ['Error']
              , message: expect.any(String)
              , stack: expect.any(String)
              }
            }
          , {
              error: {
                name: 'DOMException'
              , ancestors: ['Error']
              , message: expect.any(String)
              , stack: expect.any(String)
              }
            }
          ]
        })
      })

      test('signal isnt aborted', async () => {
        const method1 = vi.fn(async () => {
          throw new Error('message')
        })
        const method2 = vi.fn(async (message: string) => message)
        const api = {
          throws: method1
        , echo: method2
        }
        const request: IBatchRequest<unknown> = {
          protocol: 'delight-rpc'
        , version: '3.1'
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
        const controller = new AbortController()

        const result = await createResponse(api, request, {
          signal: controller.signal
        })

        expect(result).toStrictEqual({
          protocol: 'delight-rpc'
        , version: '3.1'
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
  })
})
