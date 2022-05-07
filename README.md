# delight-rpc
The easiest-to-use RPC library designed for TypeScript and JavaScript.

## Install
```sh
npm install --save delight-rpc
# or
yarn add delight-rpc
```

## Usage
### Client
```ts
import { createClient } from 'delight-rpc'

interface API {
  foo(bar: string): string
}

const client = createClient<typeof api>(adapter)
const result = await client.foo('bar')
```

### BatchClient
```ts
import { createBatchProxy, BatchClient } from 'delight-rpc'

interface IAPI {
  getNumber(): number
  getString(): string
}

const client = new BatchClient(adapter)
const proxy = createBatchProxy<IAPI>()
const results = await client.parallel(
  proxy.getNumber()
, proxy.getString()
)

// `Result` comes from the `return-style` module, it has Rust-like APIs
results[0] // Result<number, Error>
results[1] // Result<string, Error>
```

### Server
```ts
import { createResponse, IRequest, IBatchRequest } from 'delight-rpc'

const api: IAPI = {
  foo(bar: string) {
    return bar
  }
}

async function handle(
  request: IRequest<unknown> | IBatchRequest<unknown>
): Promise<IResponse<unknown> | IBatchResponse<unknown>> {
  return await createResponse(api, request)
}
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

  /**
   * An identifier used to offload multiple different RPC instances
   * over a communication channel.
   */
  channel?: string

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

interface IBatchRequest<T> extends IDelightRPC {
  id: string

  /**
   * The expected server version, based on semver.
   */
  expectedVersion?: Nullable<`${number}.${number}.${number}`>

  parallel: boolean

  requests: Array<{
    /**
     * The `method` field can include the namespace it belongs to.
     * For example, `['config','save']` represents the `save` method
     * under the namespace `config`.
     */
    method: string[]
    params: T[]
  }>
}

interface IBatchResponse<T> extends IDelightRPC {
  id: string
  responses: Array<
  | { result: T }
  | { error: SerializableError }
  >
}

type ParameterValidators<Obj> = Partial<{
  [Key in FunctionKeys<Obj> | KeysExtendType<Obj, object>]:
    Obj[Key] extends (...args: infer Args) => unknown
      ? (...args: Args) => void
      : ParameterValidators<Obj[Key]>
}>

type ImplementationOf<Obj> = {
  [Key in FunctionKeys<Obj> | KeysExtendType<Obj, object>]:
    Obj[Key] extends (...args: infer Args) => infer Result
      ? (...args: Args) => PromiseLike<Awaited<Result>> | Awaited<Result>
      : ImplementationOf<Obj[Key]>
}
```

### createClient
```ts
type ClientProxy<Obj> = {
  [Key in FunctionKeys<Obj> | KeysExtendType<Obj, object>]:
    Obj[Key] extends (...args: infer Args) => infer Result
      ? (...args: Args) => Promise<Awaited<Result>>
      : ClientProxy<Obj[Key]>
}

function createClient<API extends object, DataType = unknown>(
  adapter: IClientAdapter<DataType> 
, options?: {
    parameterValidators?: ParameterValidators<API>
    expectedVersion?: `${number}.${number}.${number}`
    channel?: string
  }
): [client: ClientProxy<API>, close: () => void]
```

For easy distinction, when the method is not available,
`MethodNotAvailable` will be thrown instead of the general `Error`.

### BatchClient
```ts
type MapRequestsToResults<RequestTuple extends IRequestForBatchRequest<unknown, unknown>[]> = {
  [Index in keyof RequestTuple]:
    RequestTuple[Index] extends IRequestForBatchRequest<infer T, unknown>
    ? Result<T, Error>
    : never
}

class BatchClient<DataType = unknown> {
  constructor(
    private adapter: IClientAdapter<DataType>
  , options?: {
      expectedVersion?: `${number}.${number}.${number}` 
      channel?: string
    }
  )

  close(): void

  async parallel<T extends IRequestForBatchRequest<unknown, DataType>[]>(
    ...requests: T
  ): Promise<MapRequestsToResults<T>>

  async series<T extends IRequestForBatchRequest<unknown, DataType>[]>(
    ...requests: T
  ): Promise<MapRequestsToResults<T>>
}
```

### createBatchProxy
```ts
type BatchClientProxy<Obj, DataType> = {
  [Key in FunctionKeys<Obj> | KeysExtendType<Obj, object>]:
    Obj[Key] extends (...args: infer Args) => infer Result
      ? (...args: Args) => IRequestForBatchRequest<Awaited<Result>, DataType>
      : BatchClientProxy<Obj[Key], DataType>
}

function createBatchProxy<API extends object, DataType = unknown>(
  options?: {
    parameterValidators?: ParameterValidators<API>
  }
): BatchClientProxy<API, DataType>
```

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

### isRequst
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

### isBatchRequest
```ts
function isBatchRequest<T>(val: unknown): val is IBatchRequest<T>
```

### isBatchResponse
```ts
function isBatchResponse<T>(val: unknown): val is IBatchResponse<T> 
```
