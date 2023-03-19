import { BatchClient } from '@src/batch-client.js'
import { VersionMismatch } from '@src/errors.js'
import { IBatchRequest, IBatchResponse } from '@delight-rpc/protocol'
import { Result } from 'return-style'
import { normalize, CustomError } from '@blackglory/errors'
import { jest } from '@jest/globals'

describe('BatchClient', () => {
  test('then method', () => {
    const send = jest.fn()
    // @ts-ignore
    const client = new BatchClient(send)

    const exists = 'then' in client
    // @ts-ignore
    const value = client.then

    expect(exists).toBe(false)
    expect(value).toBe(undefined)
  })

  test('toJSON method', () => {
    const send = jest.fn()
    // @ts-ignore
    const client = new BatchClient(send)

    const exists = 'toJSON' in client
    // @ts-ignore
    const value = client.toJSON

    expect(exists).toBe(false)
    expect(value).toBe(undefined)
  })

  describe('parallel', () => {
    test('return IBatchResponse', async () => {
      const send = jest.fn(async function (request: IBatchRequest<unknown>): Promise<IBatchResponse<unknown>> {
        return {
          protocol: 'delight-rpc'
        , version: '3.0'
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
      , version: '3.0'
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
        , version: '3.0'
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
      , version: '3.0'
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
        , version: '3.0'
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
      , version: '3.0'
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
        , version: '3.0'
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
      , version: '3.0'
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
    test('match', async () => {
      async function send(request: IBatchRequest<unknown>): Promise<IBatchResponse<unknown>> {
        return {
          protocol: 'delight-rpc'
        , version: '3.0'
        , id: request.id
        , responses: [
            { result: request.requests[0].params[0] }
          ]
        }
      }

      const client = new BatchClient(send, {
        expectedVersion: '^1.0.0'
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

    test('mismatch', async () => {
      const errorMessage = 'error message'
      async function send(request: IBatchRequest<unknown>): Promise<IBatchResponse<unknown>> {
        return {
          protocol: 'delight-rpc'
        , version: '3.0'
        , id: request.id
        , responses: [
            { error: normalize(new VersionMismatch(errorMessage)) }
          ]
        }
      }

      const client = new BatchClient(send, {
        expectedVersion: '^1.0.0'
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

  test('with channel', async () => {
    const send = jest.fn(async function send(request: IBatchRequest<unknown>): Promise<IBatchResponse<unknown>> {
      return {
        protocol: 'delight-rpc'
      , version: '3.0'
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
    , version: '3.0'
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
