import { createResponse, AnyChannel } from '@src/create-response'
import { IRequest, IBatchRequest, IBatchResponse, IResultForBatchResponse } from '@delight-rpc/protocol'
import { delay } from 'extra-promise'
import { isBatchResponse } from '@utils/is-batch-response'
import '@blackglory/jest-matchers'

const TIME_ERROR = 1

describe('createResponse', () => {
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

      const result = createResponse(api, request)
      const proResult = await result

      expect(result).toBePromise()
      expect(proResult).toStrictEqual({
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

        const result = createResponse(api, request)
        const proResult = await result

        expect(result).toBePromise()
        expect(proResult).toStrictEqual({
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

        const result = createResponse(api, request)
        const proResult = await result

        expect(result).toBePromise()
        expect(proResult).toStrictEqual({
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

      const result = createResponse(api, request)
      const proResult = await result

      expect(result).toBePromise()
      expect(method).toBeCalledTimes(1)
      expect(proResult).toStrictEqual({
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

          const result = createResponse(api, request, {
            version: '1.0.0'
          })
          const proResult = await result

          expect(result).toBePromise()
          expect(proResult).toStrictEqual({
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

          const result = createResponse(api, request, {
            version: '1.0.0'
          })
          const proResult = await result

          expect(result).toBePromise()
          expect(proResult).toMatchObject({
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

        const result = createResponse(api, request, {
          parameterValidators: validators
        })
        const proResult = await result

        expect(validator).toBeCalledWith('message')
        expect(result).toBePromise()
        expect(proResult).toStrictEqual({
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

      const result = createResponse(api, request, {
        parameterValidators: validators
      })
      const proResult = await result

      expect(validator).toBeCalledWith('message')
      expect(result).toBePromise()
      expect(proResult).toStrictEqual({
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

    describe('with channel', () => {
      test('no channel', async () => {
          const method = jest.fn(async (message: string) => message)
          const api = { echo: method }
          const request: IRequest<unknown> = {
            protocol: 'delight-rpc'
          , version: '2.2'
          , id: 'id'
          , method: ['echo']
          , params: ['message']
          , channel: 'channel'
          }

          const result = createResponse(api, request)
          const proResult = await result

          expect(result).toBePromise()
          expect(proResult).toBeNull()
      })

      describe('channel is AnyChannel', () => {
        test('request.channel', async () => {
          const method = jest.fn(async (message: string) => message)
          const api = { echo: method }
          const request: IRequest<unknown> = {
            protocol: 'delight-rpc'
          , version: '2.2'
          , id: 'id'
          , method: ['echo']
          , params: ['message']
          , channel: 'channel'
          }

          const result = createResponse(api, request, {
            channel: AnyChannel
          })
          const proResult = await result

          expect(result).toBePromise()
          expect(proResult).toStrictEqual({
            protocol: 'delight-rpc'
          , version: '2.2'
          , id: 'id'
          , result: 'message'
          , channel: 'channel'
          })
        })

        test('no request.channel', async () => {
          const method = jest.fn(async (message: string) => message)
          const api = { echo: method }
          const request: IRequest<unknown> = {
            protocol: 'delight-rpc'
          , version: '2.2'
          , id: 'id'
          , method: ['echo']
          , params: ['message']
          }

          const result = createResponse(api, request, {
            channel: AnyChannel
          })
          const proResult = await result

          expect(result).toBePromise()
          expect(proResult).toStrictEqual({
            protocol: 'delight-rpc'
          , version: '2.2'
          , id: 'id'
          , result: 'message'
          })
        })
      })

      describe('channel is a string', () => {
        test('same request.channel', async () => {
          const method = jest.fn(async (message: string) => message)
          const api = { echo: method }
          const request: IRequest<unknown> = {
            protocol: 'delight-rpc'
          , version: '2.2'
          , id: 'id'
          , method: ['echo']
          , params: ['message']
          , channel: 'channel'
          }

          const result = createResponse(api, request, {
            channel: 'channel'
          })
          const proResult = await result

          expect(result).toBePromise()
          expect(proResult).toStrictEqual({
            protocol: 'delight-rpc'
          , version: '2.2'
          , id: 'id'
          , result: 'message'
          , channel: 'channel'
          })
        })

        test('diff request.channel', async () => {
          const method = jest.fn(async (message: string) => message)
          const api = { echo: method }
          const request: IRequest<unknown> = {
            protocol: 'delight-rpc'
          , version: '2.2'
          , id: 'id'
          , method: ['echo']
          , params: ['message']
          , channel: 'channel'
          }

          const result = createResponse(api, request, {
            channel: 'diff-channel'
          })
          const proResult = await result

          expect(result).toBePromise()
          expect(proResult).toBeNull()
        })

        test('no request.channel', async () => {
          const method = jest.fn(async (message: string) => message)
          const api = { echo: method }
          const request: IRequest<unknown> = {
            protocol: 'delight-rpc'
          , version: '2.2'
          , id: 'id'
          , method: ['echo']
          , params: ['message']
          }

          const result = createResponse(api, request, {
            channel: 'channel'
          })
          const proResult = await result

          expect(result).toBePromise()
          expect(proResult).toBeNull()
        })
      })

      describe('channel is a regexp', () => {
        test('request.channel is matched', async () => {
          const method = jest.fn(async (message: string) => message)
          const api = { echo: method }
          const request: IRequest<unknown> = {
            protocol: 'delight-rpc'
          , version: '2.2'
          , id: 'id'
          , method: ['echo']
          , params: ['message']
          , channel: 'channel'
          }

          const result = createResponse(api, request, {
            channel: /^channel$/
          })
          const proResult = await result

          expect(result).toBePromise()
          expect(proResult).toStrictEqual({
            protocol: 'delight-rpc'
          , version: '2.2'
          , id: 'id'
          , result: 'message'
          , channel: 'channel'
          })
        })

        test('request.channel is not matched', async () => {
          const method = jest.fn(async (message: string) => message)
          const api = { echo: method }
          const request: IRequest<unknown> = {
            protocol: 'delight-rpc'
          , version: '2.2'
          , id: 'id'
          , method: ['echo']
          , params: ['message']
          , channel: 'channel'
          }

          const result = createResponse(api, request, {
            channel: /^diff-channel$/
          })
          const proResult = await result

          expect(result).toBePromise()
          expect(proResult).toBeNull()
        })

        test('no request.channel', async () => {
          const method = jest.fn(async (message: string) => message)
          const api = { echo: method }
          const request: IRequest<unknown> = {
            protocol: 'delight-rpc'
          , version: '2.2'
          , id: 'id'
          , method: ['echo']
          , params: ['message']
          }

          const result = createResponse(api, request, {
            channel: /^channel$/
          })
          const proResult = await result

          expect(result).toBePromise()
          expect(proResult).toBeNull()
        })
      })
    })

    describe('with ownPropsOnly', () => {
      it('is an own prop', async () => {
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

        const result = createResponse(api, request, {
           ownPropsOnly: true
        })
        const proResult = await result

        expect(result).toBePromise()
        expect(proResult).toStrictEqual({
          protocol: 'delight-rpc'
        , version: '2.2'
        , id: 'id'
        , result: 'message'
        })
      })

      it('isnt an own prop', async () => {
        const method = jest.fn(async (message: string) => message)
        const api = Object.create({
          namespace: {
            echo: method
          }
        })
        const request: IRequest<unknown> = {
          protocol: 'delight-rpc'
        , version: '2.2'
        , id: 'id'
        , method: ['namespace', 'echo']
        , params: ['message']
        }

        const result = createResponse(api, request, {
           ownPropsOnly: true
        })
        const proResult = await result

        expect(result).toBePromise()
        expect(proResult).toStrictEqual({
          protocol: 'delight-rpc'
        , version: '2.2'
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

        const result = createResponse(api, request)
        const proResult = await result

        expect(result).toBePromise()
        expect(proResult).toStrictEqual({
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

        const result = createResponse(api, request)
        const proResult = await result

        expect(result).toBePromise()
        expect(proResult).toStrictEqual({
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

        const result = createResponse(api, request, {
          version: '1.0.0'
        })
        const proResult = await result

        expect(result).toBePromise()
        expect(proResult).toStrictEqual({
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
        expect(isBatchResponse(proResult)).toBe(true)
        const response = proResult as IBatchResponse<unknown>
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

        const result = createResponse(api, request, {
          version: '1.0.0'
        })
        const proResult = await result

        expect(result).toBePromise()
        expect(proResult).toStrictEqual({
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
        expect(isBatchResponse(proResult)).toBe(true)
        const response = proResult as IBatchResponse<unknown>
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

      const result = createResponse(api, request)
      const proResult = await result

      expect(result).toBePromise()
      expect(method).toBeCalledTimes(1)
      expect(proResult).toStrictEqual({
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

          const result = createResponse(api, request, {
            parameterValidators: '1.0.0'
          })
          const proResult = await result

          expect(result).toBePromise()
          expect(proResult).toStrictEqual({
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

          const result = createResponse(api, request, {
            version: '1.0.0'
          })
          const proResult = await result

          expect(result).toBePromise()
          expect(proResult).toStrictEqual({
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

        const result = createResponse(api, request, {
          parameterValidators: validators
        })
        const proResult = await result

        expect(validator).toBeCalledWith('message')
        expect(result).toBePromise()
        expect(proResult).toStrictEqual({
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

        const result = createResponse(api, request, {
          parameterValidators: validators
        })
        const proResult = await result

        expect(validator).toBeCalledWith('message')
        expect(result).toBePromise()
        expect(proResult).toStrictEqual({
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

    describe('with channel', () => {
      test('same channel', async () => {
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
        , channel: 'channel'
        }

        const result = createResponse(api, request, {
          channel: 'channel'
        })
        const proResult = await result

        expect(result).toBePromise()
        expect(proResult).toStrictEqual({
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
        , channel: 'channel'
        })
      })

      test('diff channel', async () => {
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
        , channel: 'channel'
        }

        const result = createResponse(api, request, {
          channel: 'diff-channel'
        })
        const proResult = await result

        expect(result).toBePromise()
        expect(proResult).toBeNull()
      })
    })
  })
})
