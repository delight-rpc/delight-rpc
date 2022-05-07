import { BatchClient } from '@src/batch-client'
import { IClientAdapter, IBatchRequest, VersionMismatch } from '@src/types'
import { Result } from 'return-style'
import { normalize, CustomError } from '@blackglory/errors'
import { go, pass } from '@blackglory/prelude'
import { mocked } from 'jest-mock'
import { waitForFunction } from '@blackglory/wait-for'

describe('BatchClient', () => {
  describe('parallel', () => {
    test('return IBatchResponse', async () => {
      const adapter: IClientAdapter<unknown> = {
        send: jest.fn()
      , listen(listener) {
          go(async () => {
            await waitForFunction(() => mocked(adapter.send).mock.lastCall)
            const request = mocked(adapter.send).mock.lastCall![0] as IBatchRequest<unknown>
            listener({
              protocol: 'delight-rpc'
            , version: '2.2'
            , id: request.id
            , responses: [
                { result: 'message1' }
              , { result: 'message2' }
              ]
            })
          })
          return pass
        }
      }

      const client = new BatchClient(adapter)
      const results = await client.parallel(
        {
          method: ['method1']
        , params: ['message1']
        }
      , {
          method: ['method2']
        , params: ['message2']
        }
      )

      expect(results).toHaveLength(2)
      expect(results[0]).toBeInstanceOf(Result)
      expect(results[1]).toBeInstanceOf(Result)
      expect(results[0].isOk()).toBe(true)
      expect(results[0].unwrap()).toBe('message1')
      expect(results[1].isOk()).toBe(true)
      expect(results[1].unwrap()).toBe('message2')
      expect(adapter.send).toBeCalledTimes(1)
      expect(adapter.send).toBeCalledWith({
        protocol: 'delight-rpc'
      , version: '2.2'
      , id: expect.any(String)
      , parallel: true
      , requests: [
          {
            method: ['method1']
          , params: ['message1']
          }
        , {
            method: ['method2']
          , params: ['message2']
          }
        ]
      })
    })

    test('return IError', async () => {
      class UserError extends CustomError {}
      const adapter: IClientAdapter<unknown> = {
        send: jest.fn()
      , listen(listener) {
          go(async () => {
            await waitForFunction(() => mocked(adapter.send).mock.lastCall)
            const request = mocked(adapter.send).mock.lastCall![0] as IBatchRequest<unknown>
            listener({
              protocol: 'delight-rpc'
            , version: '2.2'
            , id: request.id
            , responses: [
                { error: normalize(new UserError('message')) }
              , { result: 'message2' }
              ]
            })
          })
          return pass
        }
      }

      const client = new BatchClient(adapter)
      const results = await client.parallel(
        {
          method: ['method1']
        , params: ['message1']
        }
      , {
          method: ['method2']
        , params: ['message2']
        }
      )

      expect(results).toHaveLength(2)
      expect(results[0]).toBeInstanceOf(Result)
      expect(results[1]).toBeInstanceOf(Result)
      expect(results[0].isErr()).toBe(true)
      expect(results[0].unwrapErr()).toBeInstanceOf(UserError)
      expect(results[0].unwrapErr().message).toBe('message')
      expect(results[1].isOk()).toBe(true)
      expect(results[1].unwrap()).toBe('message2')
      expect(adapter.send).toBeCalledTimes(1)
      expect(adapter.send).toBeCalledWith({
        protocol: 'delight-rpc'
      , version: '2.2'
      , id: expect.any(String)
      , parallel: true
      , requests: [
          {
            method: ['method1']
          , params: ['message1']
          }
        , {
            method: ['method2']
          , params: ['message2']
          }
        ]
      })
    })
  })

  describe('series', () => {
    test('return IBatchResponse', async () => {
      const adapter: IClientAdapter<unknown> = {
        send: jest.fn()
      , listen(listener) {
          go(async () => {
            await waitForFunction(() => mocked(adapter.send).mock.lastCall)
            const request = mocked(adapter.send).mock.lastCall![0] as IBatchRequest<unknown>
            listener({
              protocol: 'delight-rpc'
            , version: '2.2'
            , id: request.id
            , responses: [
                { result: 'message1' }
              , { result: 'message2' }
              ]
            })
          })
          return pass
        }
      }

      const client = new BatchClient(adapter)
      const results = await client.series(
        {
          method: ['method1']
        , params: ['message1']
        }
      , {
          method: ['method2']
        , params: ['message2']
        }
      )

      expect(results).toHaveLength(2)
      expect(results[0]).toBeInstanceOf(Result)
      expect(results[1]).toBeInstanceOf(Result)
      expect(results[0].isOk()).toBe(true)
      expect(results[0].unwrap()).toBe('message1')
      expect(results[1].isOk()).toBe(true)
      expect(results[1].unwrap()).toBe('message2')
      expect(adapter.send).toBeCalledTimes(1)
      expect(adapter.send).toBeCalledWith({
        protocol: 'delight-rpc'
      , version: '2.2'
      , id: expect.any(String)
      , parallel: false
      , requests: [
          {
            method: ['method1']
          , params: ['message1']
          }
        , {
            method: ['method2']
          , params: ['message2']
          }
        ]
      })
    })

    test('return IError', async () => {
      class UserError extends CustomError {}
      const adapter: IClientAdapter<unknown> = {
        send: jest.fn()
      , listen(listener) {
          go(async () => {
            await waitForFunction(() => mocked(adapter.send).mock.lastCall)
            const request = mocked(adapter.send).mock.lastCall![0] as IBatchRequest<unknown>
            listener({
              protocol: 'delight-rpc'
            , version: '2.2'
            , id: request.id
            , responses: [
                { error: normalize(new UserError('message')) }
              , { result: 'message2' }
              ]
            })
          })
          return pass
        }
      }

      const client = new BatchClient(adapter)
      const results = await client.series(
        {
          method: ['method1']
        , params: ['message1']
        }
      , {
          method: ['method2']
        , params: ['message2']
        }
      )

      expect(results).toHaveLength(2)
      expect(results[0]).toBeInstanceOf(Result)
      expect(results[1]).toBeInstanceOf(Result)
      expect(results[0].isErr()).toBe(true)
      expect(results[0].unwrapErr()).toBeInstanceOf(UserError)
      expect(results[0].unwrapErr().message).toBe('message')
      expect(results[1].isOk()).toBe(true)
      expect(results[1].unwrap()).toBe('message2')
      expect(adapter.send).toBeCalledTimes(1)
      expect(adapter.send).toBeCalledWith({
        protocol: 'delight-rpc'
      , version: '2.2'
      , id: expect.any(String)
      , parallel: false
      , requests: [
          {
            method: ['method1']
          , params: ['message1']
          }
        , {
            method: ['method2']
          , params: ['message2']
          }
        ]
      })
    })
  })

  describe('with expectedVersion', () => {
    describe('match', () => {
      it('return result', async () => {
        const adapter: IClientAdapter<unknown> = {
          send: jest.fn()
        , listen(listener) {
            go(async () => {
              await waitForFunction(() => mocked(adapter.send).mock.lastCall)
              const request = mocked(adapter.send).mock.lastCall![0] as IBatchRequest<unknown>
              listener({
                protocol: 'delight-rpc'
              , version: '2.2'
              , id: request.id
              , responses: [
                  { result: request.requests[0].params[0] }
                ]
              })
            })
            return pass
          }
        }

        const client = new BatchClient(adapter, {
          expectedVersion: '1.0.0'
        })
        const results = await client.series({
          method: ['echo']
        , params: ['message']
        })

        expect(results).toHaveLength(1)
        expect(results[0]).toBeInstanceOf(Result)
        expect(results[0].isOk()).toBe(true)
        expect(results[0].unwrap()).toBe('message')
      })
    })

    describe('mismatch', () => {
      it('throw VersionMismatch', async () => {
        const errorMessage = 'error message'
        const adapter: IClientAdapter<unknown> = {
          send: jest.fn()
        , listen(listener) {
            go(async () => {
              await waitForFunction(() => mocked(adapter.send).mock.lastCall)
              const request = mocked(adapter.send).mock.lastCall![0] as IBatchRequest<unknown>
              listener({
                protocol: 'delight-rpc'
              , version: '2.2'
              , id: request.id
              , responses: [
                  { error: normalize(new VersionMismatch(errorMessage)) }
                ]
              })
            })
            return pass
          }
        }

        const client = new BatchClient(adapter, {
          expectedVersion: '1.0.0'
        })
        const results = await client.series({
          method: ['echo']
        , params: ['message']
        })

        expect(results).toHaveLength(1)
        expect(results[0]).toBeInstanceOf(Result)
        expect(results[0].isErr()).toBe(true)
        expect(results[0].unwrapErr()).toBeInstanceOf(VersionMismatch)
        expect(results[0].unwrapErr().message).toBe(errorMessage)
      })
    })
  })
})
