import { Request, Response } from 'express';

export class ResponseMessage {
  public responseSuccess = async (
    req: Request,
    res: Response,
    statusCode: number,
    message: string,
    data: Record<string, any> | null,
    requestId: number
  ) => {
    return res.status(statusCode).json({
      success: true,
      message,
      data,
      requestId
    });
  };
  public responseError = async (
    req: Request,
    res: Response,
    statusCode: number,
    message: string,
    error: Record<string, any> | null,
    errorCode: number,
    requestId: number
  ) => {
    return res.status(statusCode).json({
      success: false,
      message,
      error,
      errorCode,
      requestId
    });
  };
}
