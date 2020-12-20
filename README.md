# delight-rpc

## Install

```sh
npm install --save delight-rpc
# or
yarn add delight-rpc
```

## API

### createClient

```ts
createClient<T extends object, U = unknown>(
  request: (jsonRpc: JsonRpcRequest<U>) => PromiseLike<JsonRpcResponse<U>>)
): RequestProxy<T>
```

### createResponse

```ts
createResponse<T extends object, U = unknown>(
  callables: T
, request: JsonRpcRequest<U>
): Promise<JsonRpcResponse<U>>
```
