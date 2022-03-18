import { IError } from '@src/types'
import { normalize } from '@blackglory/errors'
import { version } from './version'

export function createError(
  id: string
, error: Error
): IError {
  return {
    protocol: 'delight-rpc'
  , version
  , id
  , error: normalize(error)
  }
}
