// logging.middleware.ts
import { Request, Response, NextFunction } from 'express';
import * as morgan from 'morgan';
import logger from 'src/utils/logger';

export const accessLogStream = {
  write: (message: string) => {
    logger.info(message);
  },
};

export function accessLogMiddleware() {
  return morgan('combined', { stream: accessLogStream });
}

export function errorLogMiddleware(
  error: any,
  req: Request,
  res: Response,
  next: NextFunction,
) {
  logger.error(error.message);
  next(error);
}
