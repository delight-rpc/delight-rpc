import { IError } from '@src/types'
import { normalize } from '@blackglory/errors'

export function createError(
  id: string
, error: Error
): IError {
  return {
    protocol: 'delight-rpc'
  , version: '2.0'
  , id
  , error: normalize(error)
  }
}
