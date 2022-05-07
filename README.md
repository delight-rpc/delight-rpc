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

const [client, close] = createClient<typeof api>(adapter)
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

const closeServer = createServer(api, adapter)
```

## API
```ts
type ImplementationOf<Obj> = {
  [Key in FunctionKeys<Obj> | KeysExtendType<Obj, object>]:
    Obj[Key] extends (...args: infer Args) => infer Result
      ? (...args: Args) => PromiseLike<Awaited<Result>> | Awaited<Result>
      : ImplementationOf<Obj[Key]>
}

type ParameterValidators<Obj> = Partial<{
  [Key in FunctionKeys<Obj> | KeysExtendType<Obj, object>]:
    Obj[Key] extends (...args: infer Args) => unknown
      ? (...args: Args) => void
      : ParameterValidators<Obj[Key]>
}>

interface IClientAdapter<T> {
  send(request: IRequest<T> | IBatchRequest<T>): Promise<void>
  listen(listener: (response: IResponse<T> | IBatchResponse<T>) => void): () => void
}

interface IServerAdapter<T> {
  send(response: IResponse<T> | IBatchResponse<T>): Promise<void>
  listen(listener: (request: IRequest<T> | IBatchRequest<T>) => void): () => void
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

### createServer
```ts
function createServer<API extends object, DataType = unknown>(
  api: ImplementationOf<API>
, adapter: IServerAdapter<DataType>
, options?: {
    parameterValidators?: ParameterValidators<API>
    version?: `${number}.${number}.${number}`
    channel?: string
  }
): () => void
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
