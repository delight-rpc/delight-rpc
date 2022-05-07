import { assert, hydrate } from '@blackglory/errors'
import { IClientAdapter, IRequestForBatchRequest } from '@src/types'
import { createBatchRequest } from '@utils/create-batch-request'
import { Result } from 'return-style'
import { createUUID } from '@utils/create-uuid'
import { isError } from '@utils/is-error'
import { isBatchResponse } from '@utils/is-batch-response'
import { Deferred } from 'extra-promise'

type MapRequestsToResults<RequestTuple extends IRequestForBatchRequest<unknown, unknown>[]> = {
  [Index in keyof RequestTuple]:
    RequestTuple[Index] extends IRequestForBatchRequest<infer T, unknown>
    ? Result<T, Error>
    : never
}

export class BatchClient<DataType = unknown> {
  private pendings = new Map<string, undefined | Deferred<MapRequestsToResults<any>>>()
  private removeResponsesHandler: () => void = this.handleResponses()
  private expectedVersion?: `${number}.${number}.${number}`
  private channel?: string

  constructor(
    private adapter: IClientAdapter<DataType>
  , { expectedVersion, channel }: {
      expectedVersion?: `${number}.${number}.${number}` 
      channel?: string
    } = {}
  ) {
    this.expectedVersion = expectedVersion
    this.channel = channel
  }

  close(): void {
    this.removeResponsesHandler()
    this.pendings.clear()
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

    assert(!this.pendings.has(request.id), 'request id duplicated')
    const deferred = new Deferred<MapRequestsToResults<T>>()
    this.pendings.set(request.id, deferred)

    await this.adapter.send(request)
    return await deferred
  }

  private handleResponses(): () => void {
    return this.adapter.listen(response => {
      if (this.channel !== response.channel) return

      try {
        const deferred = this.pendings.get(response.id)
        if (deferred) {
          if (isError(response)) {
            deferred.reject(
              hydrate(response.error)
            )
          } else if (isBatchResponse(response)) {
            deferred.resolve(
              response.responses.map(x => {
                if ('result' in x) {
                  return Result.Ok(x.result)
                } else {
                  return Result.Err(hydrate(x.error))
                }
              })
            )
          }
        }
      } finally {
        this.pendings.delete(response.id)
      }
    })
  }
}
