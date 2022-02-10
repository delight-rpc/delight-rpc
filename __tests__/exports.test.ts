import * as target from '@src/index'

test('exports', () => {
  const expected = [
    'createClient'
  , 'createResponse'
  , 'MethodNotAvailable'
  , 'VersionMismatch'
  , 'InternalError'
  , 'isRequest'
  , 'isResult'
  , 'isError'
  ].sort()

  const exports = Object.keys(target).sort()

  expect(exports).toEqual(expected)
})
