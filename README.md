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

interface IAPI {
  foo(bar: string): string
}

const client = createClient<IAPI>(send)
const result = await client.foo('bar')
```

### BatchClient
```ts
import { createBatchProxy, BatchClient } from 'delight-rpc'

interface IAPI {
  getNumber(): number
  getString(): string
}

const client = new BatchClient(send)
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
  send: (request: IRequest<DataType>) => PromiseLike<IResponse<DataType>>
, options?: {
    parameterValidators?: ParameterValidators<API>
    expectedVersion?: `${number}.${number}.${number}`
    channel?: string
  }
): ClientProxy<API>
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
    send: (batchRequest: IBatchRequest<DataType>) => PromiseLike<
    | IError
    | IBatchResponse<DataType>
    >
  , options?: {
      expectedVersion?: `${number}.${number}.${number}` 
      channel?: string
    }
  )

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

### createResponse
```ts
function createResponse<API, DataType>(
  api: ImplementationOf<API>
, request: IRequest<DataType> | IBatchRequest<DataType>
, { parameterValidators = {}, version, channel }: {
    parameterValidators?: ParameterValidators<API>
    version?: `${number}.${number}.${number}`
    channel?: string
  } = {}
): Promise<null | IResponse<DataType> | IBatchResponse<DataType>>
```

`createResponse` returns `null` if the channel does not match.

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
