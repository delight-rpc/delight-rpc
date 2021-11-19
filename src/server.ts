import { applyRequest } from '@utils/apply-request'

export async function createResponse<Obj extends object, DataType = unknown>(
  api: Obj
, request: IRequest<DataType>
): Promise<IResponse<DataType>> {
  return await applyRequest(api, request)
}
