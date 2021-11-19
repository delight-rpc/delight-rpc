import { applyRequest } from '@utils/apply-request'
import { createRequest } from '@utils/create-request'
import '@blackglory/jest-matchers'

describe(`
  applyRequest<DataType>(
    api: object
  , request: IRequest<DataType>
  ): Promise<IResponse<DataType>>
`, () => {
  test('method not available', async () => {
    const api = {}
    const req = createRequest('id', ['method'], [])

    const result = applyRequest(api, req)
    const proResult = await result

    expect(result).toBePromise()
    expect(proResult).toStrictEqual({
      protocol: 'delight-rpc'
    , version: '1.0'
    , id: 'id'
    , error: {
        type: 'MethodNotAvailable'
      , message: 'The method is not available.'
      }
    })
  })

  test('method throws error', async () => {
    const method = jest.fn().mockRejectedValue(new Error('message'))
    const api = { method }
    const req = createRequest('id', ['method'], [])

    const result = applyRequest(api, req)
    const proResult = await result

    expect(result).toBePromise()
    expect(proResult).toStrictEqual({
      protocol: 'delight-rpc'
    , version: '1.0'
    , id: 'id'
    , error: {
        type: 'Error'
      , message: 'message'
      }
    })
  })

  describe('method returns result', () => {
    test('method', async () => {
      const method = jest.fn().mockImplementation(async (message: string) => message)
      const api = { method }
      const req = createRequest('id', ['method'], ['message'])

      const result = applyRequest(api, req)
      const proResult = await result

      expect(result).toBePromise()
      expect(method).toBeCalledTimes(1)
      expect(proResult).toStrictEqual({
        protocol: 'delight-rpc'
      , version: '1.0'
      , id: 'id'
      , result: 'message'
      })
    })

    test('method with namespace', async () => {
      const method = jest.fn().mockImplementation(async (message: string) => message)
      const api = {
        namespace: { method }
      }
      const req = createRequest('id', ['namespace', 'method'], ['message'])

      const result = applyRequest(api, req)
      const proResult = await result

      expect(result).toBePromise()
      expect(method).toBeCalledTimes(1)
      expect(proResult).toStrictEqual({
        protocol: 'delight-rpc'
      , version: '1.0'
      , id: 'id'
      , result: 'message'
      })
    })
  })
})
