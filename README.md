# delight-rpc
The easiest-to-use RPC library designed for TypeScript and JavaScript.

## Install
```sh
npm install --save delight-rpc
# or
yarn add delight-rpc
```

## API
### createClient
```ts
type ClientProxy<Obj> = {
  [Key in FunctionKeys<Obj> | KeysExtendType<Obj, object>]:
    Obj[Key] extends (...args: infer Args) => PromiseLike<infer Result>
      ? (...args: Args) => Promise<Result>
      : (
          Obj[Key] extends (...args: infer Args) => infer Result
            ? (...args: Args) => Promise<Result>
            : ClientProxy<Obj[Key]>
        )
}

function createClient<Obj extends object, DataType = unknown>(
  send: (request: IRequest<DataType>) => PromiseLike<IResponse<DataType>>
): ClientProxy<Obj>
```

### createResponse
```ts
function createResponse<Obj extends object, DataType = unknown>(
  api: Obj
, request: IRequest<DataType>
): Promise<IResponse<DataType>>
```
