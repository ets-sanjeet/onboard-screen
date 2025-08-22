import { Request, Response, NextFunction } from 'express';
import { ResponseMessage } from '../common/responseMessage';

export const requestMessageMiddleware = (req: Request, res: Response, next: NextFunction) => {
  // add ResponseMessage object to res.locals object.
  res.locals.responseMessage = new ResponseMessage();

  next();
};
