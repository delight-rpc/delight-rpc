import { IBatchResponse } from '@delight-rpc/protocol'
import { isDelightRPC } from './is-delight-rpc.js'
import { isArray, isString, isObject } from '@blackglory/prelude'
import { isSerializableError } from '@blackglory/errors'

export function isBatchResponse<T>(val: unknown): val is IBatchResponse<T> {
  return isDelightRPC(val)
      && isString(val.id)
      && isArray(val.responses) && val.responses.every(response => (
           isObject(response) && (
             'result' in response ||
             isSerializableError(response.error)
           )
         ))
}
