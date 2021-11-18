import { isFunction } from '@blackglory/types'
import { JsonRpcNotification } from 'justypes'
import { getParamsAsArray } from './utils'

export async function applyNotification<T>(
  callables: object
, notification: JsonRpcNotification<T>
): Promise<void> {
  const fn = Reflect.get(callables, notification.method)
  if (isFunction(fn)) {
    try {
      await Reflect.apply(fn, callables, getParamsAsArray(notification))
    } catch {}
  }
}
