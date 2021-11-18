import { applyNotification } from '@src/proxy/apply-notification'
import { notification } from '@src/creator'
import '@blackglory/jest-matchers'

describe(`
  applyNotification(
    callables: object
  , notification: JsonRpcNotification<T>
  ): Promise<void>
`, () => {
  test('method not found', async () => {
    const callables = {}
    const req = notification('fn')

    const result = applyNotification(callables, req)
    const proResult = await result

    expect(result).toBePromise()
    expect(proResult).toBeUndefined()
  })

  test('method throws error', async () => {
    const fn = jest.fn().mockRejectedValue(new Error('message'))
    const callables = { fn }
    const req = notification('fn')

    const result = applyNotification(callables, req)
    const proResult = await result

    expect(result).toBePromise()
    expect(proResult).toBeUndefined()
  })

  test('request.params doesnt exist', async () => {
    const fn = jest.fn().mockResolvedValue(undefined)
    const callables = { fn }
    const notice = notification('fn')

    const result = applyNotification(callables, notice)
    const proResult = await result

    expect(result).toBePromise()
    expect(fn).toBeCalledTimes(1)
    expect(fn).toBeCalledWith()
    expect(proResult).toBeUndefined()
  })

  test('notification.params by-position', async () => {
    const fn = jest.fn().mockResolvedValue(undefined)
    const callables = { hello: fn }
    const notice = notification('hello', ['world'])

    const result = applyNotification(callables, notice)
    const proResult = await result

    expect(result).toBePromise()
    expect(fn).toBeCalledTimes(1)
    expect(fn).toBeCalledWith('world')
    expect(proResult).toBeUndefined()
  })

  test('notification.params by-name', async () => {
    const fn = jest.fn().mockResolvedValue(undefined)
    const callables = { hello: fn }
    const notice = notification('hello', { who: 'world' })

    const result = applyNotification(callables, notice)
    const proResult = await result

    expect(result).toBePromise()
    expect(fn).toBeCalledTimes(1)
    expect(fn).toBeCalledWith({ who: 'world' })
    expect(proResult).toBeUndefined()
  })
})
