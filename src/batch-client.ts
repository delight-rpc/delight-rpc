import { hydrate } from '@blackglory/errors'
import { IBatchRequest, IError, IBatchResponse, IRequestForBatchRequest } from '@delight-rpc/protocol'
import { createBatchRequest } from '@utils/create-batch-request'
import { Result } from 'return-style'
import { createUUID } from '@utils/create-uuid'
import { isError } from '@utils/is-error'

type MapRequestsToResults<RequestTuple extends IRequestForBatchRequest<unknown, unknown>[]> = {
  [Index in keyof RequestTuple]:
    RequestTuple[Index] extends IRequestForBatchRequest<infer T, unknown>
    ? Result<T, Error>
    : never
}

export class BatchClient<DataType = unknown> {
  private expectedVersion?: string
  private channel?: string

  constructor(
    private send: (batchRequest: IBatchRequest<DataType>) => PromiseLike<
    | IError
    | IBatchResponse<DataType>
    >
  , { expectedVersion, channel }: {
      expectedVersion?: string
      channel?: string
    } = {}
  ) {
    this.expectedVersion = expectedVersion
    this.channel = channel
  }

  async parallel<T extends IRequestForBatchRequest<unknown, DataType>[]>(
    ...requests: T
  ): Promise<MapRequestsToResults<T>> {
    return await this.handleRequests(requests, true)
  }

  async series<T extends IRequestForBatchRequest<unknown, DataType>[]>(
    ...requests: T
  ): Promise<MapRequestsToResults<T>> {
    return await this.handleRequests(requests, false)
  }

  private async handleRequests<T extends IRequestForBatchRequest<unknown, DataType>[]>(
    requests: T
  , parallel: boolean
  ): Promise<MapRequestsToResults<T>> {
    const request = createBatchRequest<DataType>(
      createUUID()
    , requests
    , parallel
    , this.expectedVersion
    , this.channel
    )
    const response = await this.send(request)
    if (isError(response)) {
      throw hydrate(response.error)
    } else {
      return response.responses.map(x => {
        if ('result' in x) return Result.Ok(x.result)
        if ('error' in x) return Result.Err(hydrate(x.error))
        throw new Error('Invalid response')
      }) as MapRequestsToResults<T>
    }
  }
}
