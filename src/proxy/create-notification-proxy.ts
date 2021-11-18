import { JsonRpcNotification } from 'justypes'
import { notification } from '@src/creator'
import { FunctionKeys } from 'hotypes'

type NotificationProxy<T extends object, U> = {
  [P in FunctionKeys<T>]:
    T[P] extends (...args: infer V) => unknown
      ? (...args: V) => JsonRpcNotification<U>
      : never
}

export function createNotificationProxy<
  T extends object
, U = unknown
>(): NotificationProxy<T, U> {
  return new Proxy(Object.create(null), {
    get(_: T, prop: string) {
      if (['then'].includes(prop)) return
      return (...args: unknown[]) => notification(prop, args)
    }
  }) as NotificationProxy<T, U>
}
