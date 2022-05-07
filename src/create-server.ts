import {
  IServerAdapter
, ParameterValidators
, ImplementationOf
} from '@src/types'
import { createResponse } from '@src/create-response'

export function createServer<API extends object, DataType = unknown>(
  api: ImplementationOf<API>
, adapter: IServerAdapter<DataType>
, { parameterValidators = {}, version, channel }: {
    parameterValidators?: ParameterValidators<API>
    version?: `${number}.${number}.${number}`
    channel?: string
  } = {}
): () => void {
  const closeRequestsHandler = handleRequests()
  return () => closeRequestsHandler()

  function handleRequests(): () => void {
    return adapter.listen(async request => {
      if (channel !== request.channel) return

      adapter.send(await createResponse(api, request, {
        parameterValidators
      , version
      , channel
      }))
    })
  }
}
