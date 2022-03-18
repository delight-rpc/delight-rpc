import * as target from '@src/index'

test('exports', () => {
  const expected = [
    'createClient'
  , 'createResponse'
  , 'BatchClient'
  , 'createBatchProxy'
  , 'createBatchResponse'
  , 'MethodNotAvailable'
  , 'VersionMismatch'
  , 'InternalError'
  , 'isRequest'
  , 'isResult'
  , 'isError'
  , 'isBatchRequest'
  , 'isBatchResponse'
  ].sort()

  const exports = Object.keys(target).sort()

  expect(exports).toEqual(expected)
})
