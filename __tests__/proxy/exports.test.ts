import * as target from '@src/proxy/index'

test('exports', () => {
  const expected = [
    'createRequestProxy'
  , 'createNotificationProxy'
  , 'applyRequest'
  , 'applyNotification'
  ].sort()

  const exports = Object.keys(target).sort()

  expect(exports).toEqual(expected)
})
