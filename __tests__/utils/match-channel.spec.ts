import { matchChannel } from '@utils/match-channel.js'
import { IDelightRPC } from '@delight-rpc/protocol'
import { AnyChannel } from '@src/types.js'

describe('matchChannel', () => {
  describe('undefined', () => {
    test('matched', () => {
      const message: IDelightRPC = {
        protocol: 'delight-rpc'
      , version: '3.1'
      }

      const result = matchChannel(message, undefined)

      expect(result).toBe(true)
    })

    test('not matched', () => {
      const message: IDelightRPC = {
        protocol: 'delight-rpc'
      , version: '3.1'
      , channel: 'channel'
      }

      const result = matchChannel(message, undefined)

      expect(result).toBe(false)
    })
  })

  describe('string', () => {
    test('matched', () => {
      const message: IDelightRPC = {
        protocol: 'delight-rpc'
      , version: '3.1'
      , channel: 'channel'
      }

      const result = matchChannel(message, 'channel')

      expect(result).toBe(true)
    })

    test('not matched', () => {
      const message1: IDelightRPC = {
        protocol: 'delight-rpc'
      , version: '3.1'
      }
      const message2: IDelightRPC = {
        protocol: 'delight-rpc'
      , version: '3.1'
      , channel: 'wrong-channel'
      }

      const result1 = matchChannel(message1, 'channel')
      const result2 = matchChannel(message2, 'channel')

      expect(result1).toBe(false)
      expect(result2).toBe(false)
    })
  })

  describe('RegExp', () => {
    test('matched', () => {
      const message: IDelightRPC = {
        protocol: 'delight-rpc'
      , version: '3.1'
      , channel: 'channel'
      }

      const result = matchChannel(message, /channel/)

      expect(result).toBe(true)
    })

    test('not matched', () => {
      const message1: IDelightRPC = {
        protocol: 'delight-rpc'
      , version: '3.1'
      }
      const message2: IDelightRPC = {
        protocol: 'delight-rpc'
      , version: '3.1'
      , channel: 'chan'
      }

      const result1 = matchChannel(message1, /channel/)
      const result2 = matchChannel(message2, /channel/)

      expect(result1).toBe(false)
      expect(result2).toBe(false)
    })
  })

  test('AnyChannel', () => {
    const message1: IDelightRPC = {
      protocol: 'delight-rpc'
    , version: '3.1'
    }
    const message2: IDelightRPC = {
      protocol: 'delight-rpc'
    , version: '3.1'
    , channel: 'channel'
    }

    const result1 = matchChannel(message1, AnyChannel)
    const result2 = matchChannel(message2, AnyChannel)

    expect(result1).toBe(true)
    expect(result2).toBe(true)
  })
})
