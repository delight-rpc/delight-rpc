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
interface IBase {
  protocol: 'delight-rpc'
  version: '1.0'
}

interface IRequest<T> extends IBase {
  id: string
  
  /**
   * The `method` field can include the namespace it belongs to.
   * For example, `['config','save']` represents the `save` method
   * under the namespace `config`.
   */
  method: string[]
  params: T[]
}

type IResponse<T> = IResult<T> | IError

interface IResult<T> extends IBase {
  id: string
  result: T
}

interface IError extends IBase {
  id: string
  error: {
    /**
     * The type the error belongs to.
     */
    type: string

    /**
     * Human-readable error message.
     */
    message: string
  }
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
    Obj[Key] extends (...args: infer Args) => Awaited<infer Result>
      ? (...args: Args) => Promise<Result>
      : ClientProxy<Obj[Key]>
}

function createClient<Obj extends object, DataType = unknown>(
  send: (request: IRequest<DataType>) => PromiseLike<IResponse<DataType>>
, parameterValidators: ParameterValidators<Obj> = {}
): ClientProxy<Obj>
```

For easy distinction, when the method is not available,
`MethodNotAvailable` will be thrown instead of the general `Error`.

### MethodNotAvailable
```ts
class MethodNotAvailable extends CustomError {}
```

### ParameterValidationError
```ts
class ParameterValidationError extends CustomError {}
```

### createResponse
```ts
type ImplementationOf<Obj> = {
  [Key in FunctionKeys<Obj> | KeysExtendType<Obj, object>]:
    Obj[Key] extends (...args: infer Args) => Awaited<infer Result>
      ? (...args: Args) => PromiseLike<Result> | Result
      : ImplementationOf<Obj[Key]>
}

function createResponse<Obj extends object, DataType = unknown>(
  api: ImplementationOf<Obj>
, request: IRequest<DataType>
, parameterValidators: ParameterValidators<Obj> = {}
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
