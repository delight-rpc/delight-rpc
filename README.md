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

## Ecosystem
### HTTP
- [@delight-rpc/http-server]
- [@delight-rpc/http-client]

### Worker Threads
- [@delight-rpc/worker-threads]

### Web Workers, MessageChannel
- [@delight-rpc/browser]

[@delight-rpc/http-server]: https://www.npmjs.com/package/@delight-rpc/http-server
[@delight-rpc/http-client]: https://www.npmjs.com/package/@delight-rpc/http-client
[@delight-rpc/worker-threads]: https://www.npmjs.com/package/@delight-rpc/worker-threads
[@delight-rpc/browser]: https://www.npmjs.com/package/@delight-rpc/browser
