import { createNotificationProxy } from '@src/proxy/create-notification-proxy'

describe(`
  createNotificationProxy<
    T extends object
  , U = unknown
  >(): NotificationProxy<T, U>
`, () => {
  it('create a proxy', () => {
    interface Remote {
      hello(who: string): string
    }

    const result = createNotificationProxy<Remote>().hello('world')

    expect(result).toStrictEqual({
      jsonrpc: '2.0'
    , method: 'hello'
    , params: ['world']
    })
  })

  it('does not allow proxy `then`', async () => {
    const result = createNotificationProxy()

    // @ts-ignore
    expect(result.then).toBeUndefined()
  })
})
