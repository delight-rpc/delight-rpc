import * as target from '@src/index.js'

test('exports', () => {
  const expected = [
    'createClient'
  , 'BatchClient'
  , 'createBatchProxy'
  , 'createResponse'
  , 'AnyChannel'
  , 'MethodNotAvailable'
  , 'VersionMismatch'
  , 'InternalError'
  , 'isRequest'
  , 'isResult'
  , 'isError'
  , 'isBatchRequest'
  , 'isBatchResponse'
  , 'matchChannel'
  ].sort()

  const exports = Object.keys(target).sort()

  expect(exports).toEqual(expected)
})
