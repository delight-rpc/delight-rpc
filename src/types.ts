import { FunctionKeys, KeysByType } from 'hotypes'
import { Awaitable } from '@blackglory/prelude'

export const AnyChannel = Symbol()

export type ImplementationOf<Obj> = {
  [Key in FunctionKeys<Obj> | KeysByType<Obj, object>]:
    Obj[Key] extends (...args: infer Args) => infer Result
      ? (...args: [...args: Args, signal?: AbortSignal]) => Awaitable<Awaited<Result>>
      : ImplementationOf<Obj[Key]>
}

export type ParameterValidators<Obj> = Partial<{
  [Key in FunctionKeys<Obj> | KeysByType<Obj, object>]:
    Obj[Key] extends (...args: infer Args) => unknown
      ? (...args: Args) => void
      : ParameterValidators<Obj[Key]>
}>
