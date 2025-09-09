import { NextFunction, Request, Response } from "express";
import { userModel } from "../models/user.model";
import { IUser } from "../common/interfaces/user.interface";
import createError from "http-errors";
import bcrypt from "bcrypt";
import { JwtService } from "../common/jwt/jwtHelper";
import { HydratedDocument } from "mongoose";
import { EmailService } from "../common/sendEmail";
import { UserValidation } from "../common/Joi/userValidations/users.joi";
import Logger from "../common/logger";
import { ErrorConstants } from "../common/constants";
import winston from "winston";

export class UserController {
  private model = userModel;
  private userValidation: UserValidation;
  private emailService: EmailService;
  private jwtService: JwtService;
  private logger: winston.Logger;
  constructor() {
    this.emailService = new EmailService();
    this.jwtService = new JwtService();
    this.userValidation = new UserValidation();
    this.logger = new Logger().createLogger();
  } // Registers a new user.

  public register = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    const { username, email, password } = req.body;
    try {
      // validate the request body.
      await this.userValidation.validate(
        { username, email, password },
        UserValidation.schemas.registerSchema
      );
      const isUserExist: HydratedDocument<IUser> | null =
        await this.model.findOne({ email: email });
      if (isUserExist) {
        throw createError(409, {
          message: "Email Is Already Exists.",
          errorCode: ErrorConstants.ERROR_DUPLICATE_ENTRY,
        });
      } else {
        const newUser: HydratedDocument<IUser> = await this.model.create({
          username: username,
          email: email,
          password: password, // As requested, email verification is directly set to true since the email service is down.
          is_email_verified: true,
          email_verified_at: new Date(),
        });

        res.locals.responseMessage.responseSuccess(
          req,
          res,
          201,
          "User has been successfully registered.",
          {
            email: newUser.email,
          },
          res.locals.requestId
        );
      }
    } catch (error: any) {
      if (error.code === 11000) {
        const duplicateFeild = Object.keys((error as any).keyPattern || {})[0];
        next(
          createError(409, {
            message: `${duplicateFeild} is already in use.`,
            errorCode: ErrorConstants.ERROR_DUPLICATE_ENTRY,
          })
        );
      } else {
        next(error);
      }
    }
  }; // login a user.

  public login = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    const { email, password } = req.body;
    try {
      // validate the request body.
      await this.userValidation.validate(
        { email, password },
        UserValidation.schemas.loginSchema
      );
      const isUserExist: HydratedDocument<IUser> | null =
        await this.model.findOne({ email: email });
      if (!isUserExist) {
        throw createError(404, {
          message: `${email} does not exist.`,
          errorCode: ErrorConstants.ERROR_USER_NOT_FOUND,
        });
      }
      const isMatch = await bcrypt.compare(password, isUserExist.password);

      if (!isMatch) {
        throw createError(401, {
          message: `Invalid username or password`,
          errorCode: ErrorConstants.ERROR_INVALID_CREDENTIALS,
        });
      } // generate a access token.

      const token = await this.jwtService.signAccessToken(
        isUserExist._id.toString("hex")
      );

      let redirectPath = isUserExist.is_onboarding_complete
        ? "./home"
        : "/onboarding";
      res.locals.responseMessage.responseSuccess(
        req,
        res,
        200,
        "ok",
        {
          accesstoken: token,
          redirect: redirectPath,
        },
        res.locals.requestId
      );
    } catch (error) {
      next(error);
    }
  }; // verify the email Address Via OTP.

  public verifyOTPViaClient = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    const { otp, email, token } = req.body;
    try {
      // validate the request body.
      await this.userValidation.validate(
        { otp, email, token },
        UserValidation.schemas.verifyOTPSchema
      );
      const isUserExist: HydratedDocument<IUser> | null =
        await this.model.findOne({
          email: email,
        });
      if (!isUserExist) {
        throw createError(404, {
          message: `${email} does not exist.`,
          errorCode: ErrorConstants.ERROR_USER_NOT_FOUND,
        });
      }
      if (isUserExist.email_verification_expires) {
        if (new Date() > isUserExist.email_verification_expires) {
          throw createError(400, {
            message: `verification token expired. Verify your email address again.`,
            errorCode: ErrorConstants.ERROR_EXPIRED_TOKEN,
          });
        }
      }
      if (
        !isUserExist.email_verification_token ||
        !isUserExist.email_verification_otp
      ) {
        throw createError(400, {
          message: `No verification token or OTP is not found for user with email:${email}.`,
          errorCode: ErrorConstants.ERROR_USER_DATA_NOT_FOUND,
        });
      } //Verify the token first
      const isValidToken = await this.emailService.verifyToken(
        token,
        isUserExist.email_verification_token
      );
      if (!isValidToken) {
        throw createError(400, {
          message: `Invalid token provided.`,
          errorCode: ErrorConstants.ERROR_INVALID_TOKEN,
        });
      } //Cross-check the OTP
      if (isUserExist.email_verification_otp !== otp) {
        throw createError(400, {
          message: `Invalid OTP provided.`,
          errorCode: ErrorConstants.ERROR_INVALID_OTP,
        });
      } //If both token and OTP are valid, update user verification status

      isUserExist.is_email_verified = true;
      isUserExist.email_verification_token = null;
      isUserExist.email_verification_otp = null;
      isUserExist.email_verification_expires = null;
      isUserExist.email_verified_at = new Date();
      await isUserExist.save();
      res.locals.responseMessage.responseSuccess(
        req,
        res,
        200,
        "Email successfully verified.",
        null,
        res.locals.requestId
      );
    } catch (error) {
      next(error);
    }
  }; // send an emial to verify the email address via otp.

  public sendOTPViaEmail = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    const { email, token } = req.body;
    let new_token: string | null = null;
    try {
      // validate the request body.
      await this.userValidation.validate(
        { email, token },
        UserValidation.schemas.sendOTPSchema
      );

      const isUserExist: HydratedDocument<IUser> | null =
        await this.model.findOne({
          email: email,
        });
      if (!isUserExist) {
        throw createError(404, {
          message: `${email} does not exist.`,
          errorCode: ErrorConstants.ERROR_USER_NOT_FOUND,
        });
      }
      if (
        !isUserExist.email_verification_expires ||
        !isUserExist.email_verification_token ||
        !isUserExist.email_verification_otp
      ) {
        throw createError(400, {
          message: `No verification token or OTP is not found for user with email:${email}.`,
          errorCode: ErrorConstants.ERROR_USER_DATA_NOT_FOUND,
        });
      } // Verify the token first.

      const isValidToken = await this.emailService.verifyToken(
        token,
        isUserExist.email_verification_token
      );
      if (!isValidToken) {
        throw createError(400, {
          message: `Invalid token provided.`,
          errorCode: ErrorConstants.ERROR_INVALID_TOKEN,
        });
      }
      const isTokenExpired =
        new Date() > isUserExist.email_verification_expires;
      if (isTokenExpired) {
        if (!isUserExist.is_email_verified) {
          new_token = await EmailService.generateToken();
          const hashToken: string = await this.emailService.hashToken(
            new_token
          );
          const otp: string = await this.emailService.generateOTP(8);
          if (!token || !otp || !hashToken) {
            throw createError(500, {
              message: `Internal Server Issue.`,
              errorCode: ErrorConstants.ERROR_SERVER_ERROR,
            });
          } // send an email.
          await this.emailService.sendEmail({
            recipient_email: email,
            subject: `SimpliShare: Here's the 8-digit verification code you requested`,
            otp: otp,
          });
          isUserExist.email_verification_token = hashToken;
          isUserExist.email_verification_otp = otp;
          isUserExist.email_verification_expires = new Date(
            Date.now() + 5 * 60 * 1000
          );

          await isUserExist.save();

          res.locals.responseMessage.responseSuccess(
            req,
            res,
            200,
            "OTP sent succesfully.",
            {
              email: email,
              token: new_token,
            },
            res.locals.requestId
          );
        } else {
          throw createError(400, {
            message: `Email is already verified. No need to request a new OTP.`,
            errorCode: ErrorConstants.ERROR_EMAIL_ALREADY_VERIFIED,
          });
        }
      } else {
        res.locals.responseMessage.responseSuccess(
          req,
          res,
          200,
          "Token is still valid. No new OTP sent.",
          {
            email,
            token,
          },
          res.locals.requestId
        );
      }
    } catch (error) {
      next(error);
    }
  };

  public onboarding = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const {
        first_name,
        last_name,
        profession,
        company_name,
        industry,
        team_size,
        looking_for,
        is_onboarding_complete,
        instagram_Connected,
      } = req.body;

      // Get the user ID from the authenticated token (set by auth middleware)
      const userId = res.locals.userId;

      if (!userId) {
        throw createError(401, {
          message: "Authentication required",
          errorCode: ErrorConstants.ERROR_UNAUTHORIZED_ACCESS,
        });
      }

      // Validate the request body (remove email from validation)
      await this.userValidation.validate(
        {
          first_name,
          last_name,
          profession,
          company_name,
          industry,
          team_size,
          looking_for,
          is_onboarding_complete,
          instagram_Connected,
        },
        UserValidation.schemas.onboardingSchema
      );

      // Find the user by ID (not email) to ensure we're updating the logged-in user
      const user = await this.model.findById(userId);

      if (!user) {
        throw createError(404, {
          message: "User not found",
          errorCode: ErrorConstants.ERROR_USER_NOT_FOUND,
        });
      }

      // Update the authenticated user's profile
      user.first_name = first_name;
      user.last_name = last_name;
      user.profession = profession;
      user.company_name = company_name;
      user.industry = industry;
      user.team_size = team_size;
      user.looking_for = looking_for;
      user.is_onboarding_complete = is_onboarding_complete;
      user.instagram_Connected = instagram_Connected;

      await user.save();
      this.logger.info(`User profile updated: ${user.email}`);

      // Return success response
      res.locals.responseMessage.responseSuccess(
        req,
        res,
        200,
        "Onboarding process completed successfully.",
        {
          email: user.email,
          first_name: user.first_name,
          last_name: user.last_name,
          is_onboarding_complete: user.is_onboarding_complete,
        },
        res.locals.requestId
      );
    } catch (error) {
      next(error);
    }
  };
}
