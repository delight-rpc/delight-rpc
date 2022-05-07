import { CustomError } from '@blackglory/errors'

export class MethodNotAvailable extends CustomError {}
export class VersionMismatch extends CustomError {}
export class InternalError extends CustomError {}
