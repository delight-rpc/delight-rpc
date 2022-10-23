import { BatchClient } from '@src/batch-client'
import { VersionMismatch } from '@src/errors'
import { IBatchRequest, IBatchResponse } from '@delight-rpc/protocol'
import { Result } from 'return-style'
import { normalize, CustomError } from '@blackglory/errors'

describe('BatchClient', () => {
  describe('then method', () => {
    it('return undefined', () => {
      const send = jest.fn()
      const client = new BatchClient(send)

      // @ts-ignore
      const value = client.then
      const exists = 'then' in client

      expect(value).toBe(undefined)
      expect(exists).toBe(false)
    })
  })

  describe('toJSON method', () => {
    it('return undefined', () => {
      const send = jest.fn()
      const client = new BatchClient(send)

      // @ts-ignore
      const value = client.toJSON
      const exists = 'toJSON' in client

      expect(value).toBe(undefined)
      expect(exists).toBe(false)
    })
  })

  describe('parallel', () => {
    test('return IBatchResponse', async () => {
      const send = jest.fn(async function (request: IBatchRequest<unknown>): Promise<IBatchResponse<unknown>> {
        return {
          protocol: 'delight-rpc'
        , version: '2.2'
        , id: request.id
        , responses: [
            { result: 'message1' }
          , { result: 'message2' }
          ]
        }
      })

      const client = new BatchClient(send)
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
      expect(send).toBeCalledTimes(1)
      expect(send).toBeCalledWith({
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
      const send = jest.fn(async function (request: IBatchRequest<unknown>): Promise<IBatchResponse<unknown>> {
        return {
          protocol: 'delight-rpc'
        , version: '2.2'
        , id: request.id
        , responses: [
            { error: normalize(new UserError('message')) }
          , { result: 'message2' }
          ]
        }
      })

      const client = new BatchClient(send)
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
      expect(send).toBeCalledTimes(1)
      expect(send).toBeCalledWith({
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
      const send = jest.fn(async function (request: IBatchRequest<unknown>): Promise<IBatchResponse<unknown>> {
        return {
          protocol: 'delight-rpc'
        , version: '2.2'
        , id: request.id
        , responses: [
            { result: 'message1' }
          , { result: 'message2' }
          ]
        }
      })

      const client = new BatchClient(send)
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
      expect(send).toBeCalledTimes(1)
      expect(send).toBeCalledWith({
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
      const send = jest.fn(async function (request: IBatchRequest<unknown>): Promise<IBatchResponse<unknown>> {
        return {
          protocol: 'delight-rpc'
        , version: '2.2'
        , id: request.id
        , responses: [
            { error: normalize(new UserError('message')) }
          , { result: 'message2' }
          ]
        }
      })

      const client = new BatchClient(send)
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
      expect(send).toBeCalledTimes(1)
      expect(send).toBeCalledWith({
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
        async function send(request: IBatchRequest<unknown>): Promise<IBatchResponse<unknown>> {
          return {
            protocol: 'delight-rpc'
          , version: '2.2'
          , id: request.id
          , responses: [
              { result: request.requests[0].params[0] }
            ]
          }
        }

        const client = new BatchClient(send, {
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
        async function send(request: IBatchRequest<unknown>): Promise<IBatchResponse<unknown>> {
          return {
            protocol: 'delight-rpc'
          , version: '2.2'
          , id: request.id
          , responses: [
              { error: normalize(new VersionMismatch(errorMessage)) }
            ]
          }
        }

        const client = new BatchClient(send, {
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

  test('with channel', async () => {
    const send = jest.fn(async function send(request: IBatchRequest<unknown>): Promise<IBatchResponse<unknown>> {
      return {
        protocol: 'delight-rpc'
      , version: '2.2'
      , id: request.id
      , responses: [
          { result: 'message1' }
        , { result: 'message2' }
        ]
      }
    })

    const client = new BatchClient(send, { 
      channel: 'channel'
    })
    await client.parallel(
      {
        method: ['method1']
      , params: ['message1']
      }
    , {
        method: ['method2']
      , params: ['message2']
      }
    )

    expect(send).toBeCalledTimes(1)
    expect(send).toBeCalledWith({
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
    , channel: 'channel'
    })
  })
})
