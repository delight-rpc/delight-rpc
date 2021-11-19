import { createRequestProxy } from '@utils/create-request-proxy'

describe(`
  createRequestProxy<Obj extends object, DataType = unknown>(
    createId: () => string
  ): RequestProxy<Obj, DataType>
`, () => {
  describe('create a proxy', () => {
    test('shallow method', () => {
      interface IAPI {
        method(param: string): string
      }
      const createId = jest.fn().mockReturnValue('id')

      const result = createRequestProxy<IAPI>(createId).method('param')

      expect(createId).toBeCalledTimes(1)
      expect(result).toStrictEqual({
        protocol: 'delight-rpc'
      , version: '1.0'
      , id: 'id'
      , method: ['method']
      , params: ['param']
      })
    })

    test('deep method', () => {
      interface IAPI {
        namespace: {
          method(param: string): string
        }
        haha: number
      }

      const createId = jest.fn().mockReturnValue('id')

      const proxy = createRequestProxy<IAPI>(createId)
      const result = proxy.namespace.method('param')

      expect(createId).toBeCalledTimes(1)
      expect(result).toStrictEqual({
        protocol: 'delight-rpc'
      , version: '1.0'
      , id: 'id'
      , method: ['namespace', 'method']
      , params: ['param']
      })
    })
  })

  it('does not allow proxy `then`', async () => {
    const createId = jest.fn().mockReturnValue(0)
    const result = createRequestProxy(createId)

    // @ts-ignore
    expect(result.then).toBeUndefined()
  })
})
