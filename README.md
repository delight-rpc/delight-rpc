# delight-rpc
The easiest-to-use RPC library designed for TypeScript and JavaScript.

## Install
```sh
npm install --save delight-rpc
# or
yarn add delight-rpc
```

## API
```ts
/**
 * The reason why it is divided into two fields
 * is to make it easier to distinguish
 * when sharing channels with other protocols.
 * 
 * Reducing the size of payloads is not the goal of Delight RPC.
 */
interface IDelightRPC {
  protocol: 'delight-rpc'
  version: `2.${number}`

  [key: string]: unknown
}

interface IRequest<T> extends IDelightRPC {
  id: string

  /**
   * The expected server version, based on semver.
   */
  expectedVersion?: Nullable<`${number}.${number}.${number}`>
  
  /**
   * The `method` field can include the namespace it belongs to.
   * For example, `['config','save']` represents the `save` method
   * under the namespace `config`.
   */
  method: string[]
  params: T[]
}

type IResponse<T> = IResult<T> | IError

interface IResult<T> extends IDelightRPC {
  id: string
  result: T
}

interface SerializableError {
  name: string
  message: string
  stack: string | null
  ancestors: string[]
}

interface IError extends IDelightRPC {
  id: string
  error: SerializedError 
}

type ParameterValidators<Obj> = Partial<{
  [Key in FunctionKeys<Obj> | KeysExtendType<Obj, object>]:
    Obj[Key] extends (...args: infer Args) => unknown
      ? (...args: Args) => void
      : ParameterValidators<Obj[Key]>
}>
```

### createClient
```ts
type ClientProxy<Obj> = {
  [Key in FunctionKeys<Obj> | KeysExtendType<Obj, object>]:
    Obj[Key] extends (...args: infer Args) => infer Result
      ? (...args: Args) => Promise<Awaited<Result>>
      : ClientProxy<Obj[Key]>
}

function createClient<Obj extends object, DataType = unknown>(
  send: (request: IRequest<DataType>) => PromiseLike<IResponse<DataType>>
, parameterValidators: ParameterValidators<Obj> = {}
, expectedVersion?: `${number}.${number}.${number}`
): ClientProxy<Obj>
```

For easy distinction, when the method is not available,
`MethodNotAvailable` will be thrown instead of the general `Error`.

### MethodNotAvailable
```ts
class MethodNotAvailable extends CustomError {}
```

### VersionMismatch
```ts
class VersionMismatch extends CustomError {}
```

### InternalError
```ts
class InternalError extends CustomError {}
```

### createResponse
```ts
type ImplementationOf<Obj> = {
  [Key in FunctionKeys<Obj> | KeysExtendType<Obj, object>]:
    Obj[Key] extends (...args: infer Args) => infer Result
      ? (...args: Args) => PromiseLike<Awaited<Result>> | Awaited<Result>
      : ImplementationOf<Obj[Key]>
}

function createResponse<Obj extends object, DataType = unknown>(
  api: ImplementationOf<Obj>
, request: IRequest<DataType>
, parameterValidators: ParameterValidators<Obj> = {}
, version?: `${number}.${number}.${number}`
): Promise<IResponse<DataType>>
```

### isRequest
```ts
function isRequest<DataType>(val: unknown): val is IRequest<DataType>
```

### isResult
```ts
function isResult<DataType>(val: unknown): val is IResult<DataType> 
```

### isError
```ts
function isError(val: unknown): val is IError
```
