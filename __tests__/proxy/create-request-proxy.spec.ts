import { createRequestProxy } from '@src/proxy/create-request-proxy'

describe(`
  createRequestProxy<T extends object, U = unknown>(
    createId: () => string
  ): RequestProxy<T, U>
`, () => {
  it('create a proxy', () => {
    interface Remote {
      hello(who: string): string
    }
    const createId = jest.fn().mockReturnValue(0)

    const result = createRequestProxy<Remote>(createId).hello('world')

    expect(createId).toBeCalledTimes(1)
    expect(result).toStrictEqual({
      jsonrpc: '2.0'
    , id: 0
    , method: 'hello'
    , params: ['world']
    })
  })

  it('does not allow proxy `then`', async () => {
    const createId = jest.fn().mockReturnValue(0)
    const result = createRequestProxy(createId)

    // @ts-ignore
    expect(result.then).toBeUndefined()
  })
})
