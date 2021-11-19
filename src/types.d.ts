/**
 * 之所以分为两个字段, 是为了在与其他协议共享信道时方便区分.
 * 减小载荷的体积并不是Delight RPC追求的目标.
 */
interface IBase {
  protocol: 'delight-rpc'
  version: '1.0'
}

interface IRequest<T> extends IBase {
  id: string
  
  /**
   * 方法名可以包含它所属的命名空间, 例如['config', 'save']代表命名空间config下的save方法.
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
     * 该错误所属的类别
     */
    type: string

    /**
     * 人类可读的错误信息
     */
    message: string
  }
}
