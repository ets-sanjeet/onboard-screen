import { NextFunction, Request, Response } from 'express';
import jwt, { Secret, SignOptions, VerifyErrors } from 'jsonwebtoken';
import createError from 'http-errors';
import EnvVars from '../../../config/envConfig';
import { ErrorConstants } from '../constants';

export class JwtService {
  private secretKey: Secret;
  private envVars: EnvVars;
  constructor() {
    this.envVars = new EnvVars();
    this.secretKey = this.envVars.get('JWT_SECRET') as string;
  }

  // Assign the token to the logging user.
  public signAccessToken = (userId: string): Promise<string> => {
    return new Promise((resolve, reject) => {
      const payload = { id: userId };
      const options: SignOptions = {
        algorithm: 'HS256',
        issuer: 'simplishareserver.com'
      };

      jwt.sign(payload, this.secretKey, options, (err, token) => {
        if (err || !token) {
          reject(createError(500, { message: `Token Generation Failed.`, errorCode: ErrorConstants.ERROR_SERVER_ERROR }));
        } else {
          resolve(token);
        }
      });
    });
  };

  // public verifyAccessToken = (req: Request, res: Response, next: NextFunction): void => {
  //   try {
  //     const authHeader = req.headers['authorization'];
  //     if (!authHeader) {
  //       throw createError(401, {
  //         message: 'Authorization header is missing.',
  //         errorCode: ErrorConstants.ERROR_UNAUTHORIZED_ACCESS
  //       });
  //     }

  //     const bearerToken = authHeader.split(' ');
  //     if (bearerToken.length !== 2) {
  //       throw createError(401, {
  //         message: 'Invalid Authorization Format.',
  //         errorCode: ErrorConstants.ERROR_UNAUTHORIZED_ACCESS
  //       });
  //     }

  //     const token = bearerToken[1];
  //     jwt.verify(token, this.secretKey, (err: VerifyErrors | null, payload?: string | jwt.JwtPayload) => {
  //       if (err || !payload) {
  //         return next(
  //           createError(401, {
  //             message: 'Invalid or Expired Token.',
  //             errorCode: ErrorConstants.ERROR_INVALID_TOKEN
  //           })
  //         );
  //       }
  //       req.payload = payload;
  //       next();
  //     });
  //   } catch (error) {
  //     next(error);
  //   }
  // };


// In your JwtService class
public verifyAccessToken = (req: Request, res: Response, next: NextFunction): void => {
  try {
    const authHeader = req.headers['authorization'];
    if (!authHeader) {
      throw createError(401, {
        message: 'Authorization header is missing.',
        errorCode: ErrorConstants.ERROR_UNAUTHORIZED_ACCESS
      });
    }

    const bearerToken = authHeader.split(' ');
    if (bearerToken.length !== 2) {
      throw createError(401, {
        message: 'Invalid Authorization Format.',
        errorCode: ErrorConstants.ERROR_UNAUTHORIZED_ACCESS
      });
    }

    const token = bearerToken[1];
    jwt.verify(token, this.secretKey, (err: VerifyErrors | null, payload?: string | jwt.JwtPayload) => {
      if (err || !payload) {
        return next(
          createError(401, {
            message: 'Invalid or Expired Token.',
            errorCode: ErrorConstants.ERROR_INVALID_TOKEN
          })
        );
      }
      
      // Extract user ID from payload and add to response locals
      if (typeof payload === 'object' && 'id' in payload) {
        res.locals.userId = (payload as any).id;
      }
      
      next();
    });
  } catch (error) {
    next(error);
  }
};









}
