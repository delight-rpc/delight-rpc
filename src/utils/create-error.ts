import { IError } from '@src/types'
import { normalize } from '@blackglory/errors'
import { version } from './version'
import { isntUndefined } from '@blackglory/prelude'

export function createError(
  id: string
, error: Error
, channel: string | undefined
): IError {
  const err: IError = {
    protocol: 'delight-rpc'
  , version
  , id
  , error: normalize(error)
  }
  if (isntUndefined(channel)) {
    err.channel = channel
  }

  return err
}
