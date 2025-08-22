import { Request, Response, NextFunction } from 'express';
import Logger from '../common/logger';

// create an instance of logger class
const loggerInstance = new Logger();

// create a logger obj.
const logger = loggerInstance.createLogger();
/**
 * Assign a unique request ID to every incoming request.
 * Tag all logs and responses with this request ID.
 */

export const requestIdMiddleware = (req: Request, res: Response, next: NextFunction) => {
  // generate a random ID and add to res.locals object.
  res.locals.requestId = Math.floor(100000 + Math.random() * 900000);

  // add above id to logger too.
  logger.info('new request'.toUpperCase(), { requestId: res.locals.requestId, originalUrl: req.originalUrl, method: req.method });

  next();
};
