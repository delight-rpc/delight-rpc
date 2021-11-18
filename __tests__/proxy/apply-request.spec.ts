import { applyRequest } from '@src/proxy/apply-request'
import { request } from '@src/creator'
import '@blackglory/jest-matchers'

describe(`
  applyRequest(
    callables: object
  , request: JsonRpcRequest<T>
  ): Promise<JsonRpcResponse<T>>
`, () => {
  test('method not found', async () => {
    const callables = {}
    const req = request(0, 'fn')

    const result = applyRequest(callables, req)
    const proResult = await result

    expect(result).toBePromise()
    expect(proResult).toStrictEqual({
      jsonrpc: '2.0'
    , id: 0
    , error: {
        code: -32601
      , message: 'The method does not exist / is not available.'
      }
    })
  })

  test('method throws error', async () => {
    const fn = jest.fn().mockRejectedValue(new Error('message'))
    const callables = { fn }
    const req = request(0, 'fn')

    const result = applyRequest(callables, req)
    const proResult = await result

    expect(result).toBePromise()
    expect(proResult).toStrictEqual({
      jsonrpc: '2.0'
    , id: 0
    , error: {
        code: -32000
      , message: 'Error: message'
      }
    })
  })

  test('request.params doesnt exist', async () => {
    const fn = jest.fn().mockResolvedValue('hello world')
    const callables = { fn }
    const req = request(0, 'fn')

    const result = applyRequest(callables, req)
    const proResult = await result

    expect(result).toBePromise()
    expect(fn).toBeCalledTimes(1)
    expect(proResult).toStrictEqual({
      jsonrpc: '2.0'
    , id: 0
    , result: 'hello world'
    })
  })

  test('request.params by-position', async () => {
    const fn = jest.fn().mockImplementation(async (message: string) => message)
    const callables = { fn }
    const req = request(0, 'fn', ['message'])

    const result = applyRequest(callables, req)
    const proResult = await result

    expect(result).toBePromise()
    expect(fn).toBeCalledTimes(1)
    expect(proResult).toStrictEqual({
      jsonrpc: '2.0'
    , id: 0
    , result: 'message'
    })
  })

  test('request.params by-name', async () => {
    const fn = jest.fn().mockImplementation(async ({ message }: { message: string }) => message)
    const callables = { fn }
    const req = request(0, 'fn', { message: 'hello world' })

    const result = applyRequest(callables, req)
    const proResult = await result

    expect(result).toBePromise()
    expect(fn).toBeCalledTimes(1)
    expect(proResult).toStrictEqual({
      jsonrpc: '2.0'
    , id: 0
    , result: 'hello world'
    })
  })
})
