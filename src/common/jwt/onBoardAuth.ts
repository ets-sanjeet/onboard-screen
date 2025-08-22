// auth.middleware.ts
import { Request, Response, NextFunction } from 'express';
import { JwtService } from '../jwt/jwtHelper';

const jwtService = new JwtService();

export const authenticate = (req: Request, res: Response, next: NextFunction): void => {
  jwtService.verifyAccessToken(req, res, next);
};