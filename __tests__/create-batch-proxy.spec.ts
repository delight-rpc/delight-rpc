import { createBatchProxy } from '@src/create-batch-proxy'
import { getError } from 'return-style'

describe('createBatchProxy', () => {
  describe('then method', () => {
    it('return undefined', () => {
      const send = jest.fn()

      const proxy = createBatchProxy(send)

      // @ts-ignore
      expect(proxy.then).toBeUndefined()
    })
  })

  it('return IRequestForBatchRequest', async () => {
    interface IAPI {
      echo(message: string): string
    }
    const message = 'message'

    const proxy = createBatchProxy<IAPI>()
    const result = proxy.echo(message)

    expect(result).toStrictEqual({
      method: ['echo']
    , params: ['message']
    })
  })

  test('with namespace', () => {
    interface IAPI {
      namespace: {
        echo(message: string): string
      }
    }
    const message = 'message'

    const proxy = createBatchProxy<IAPI>()
    const result = proxy.namespace.echo(message)

    expect(result).toStrictEqual({
      method: ['namespace', 'echo']
    , params: [message]
    })
  })

  describe('with validators', () => {
    it('pass', () => {
      interface IAPI {
        namespace: {
          echo(message: string): string
        }
      }
      const validator = jest.fn()
      const validators = {
        namespace: {
          echo: validator
        }
      }
      const message = 'message'

      const client = createBatchProxy<IAPI>(validators)
      const result = client.namespace.echo(message)

      expect(validator).toBeCalledWith(message)
      expect(result).toStrictEqual({
        method: ['namespace', 'echo']
      , params: [message]
      })
    })

    it('not pass', () => {
      interface IAPI {
        namespace: {
          echo(message: string): string
        }
      }
      const validator = jest.fn(() => {
        throw new Error('custom error')
      })
      const validators = {
        namespace: {
          echo: validator
        }
      }
      const message = 'message'

      const client = createBatchProxy<IAPI>(validators)
      const err = getError(() => client.namespace.echo(message))

      expect(validator).toBeCalledWith(message)
      expect(err).toBeInstanceOf(Error)
      expect(err!.message).toBe('custom error')
    })
  })
})
