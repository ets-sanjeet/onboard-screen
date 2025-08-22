import { JwtPayload } from 'jsonwebtoken';
import { ResponseMessage } from '../../src/common/responseMessage';

declare module 'express-serve-static-core' {
  interface Request {
    payload?: string | JwtPayload;
  }

  interface Locals {
    requestId: number;
    responseMessage: ResponseMessage;
  }
}
