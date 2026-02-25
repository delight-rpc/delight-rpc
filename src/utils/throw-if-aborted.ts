import { isntUndefined } from '@blackglory/prelude'
import { AbortError } from 'extra-abort'

export function throwIfAborted(signal: AbortSignal): void {
  if (signal.aborted) {
    if (isntUndefined(signal.reason)) {
      throw signal.reason
    } else {
      throw new AbortError()
    }
  }
}
