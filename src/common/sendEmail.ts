import { EmailClient, EmailSendResponse } from '@azure/communication-email';
import EnvVars from '../../config/envConfig';
import * as crypto from 'crypto';
import createError from 'http-errors';
import { RestError } from '@azure/core-rest-pipeline';
import { EmailParamsType } from './types/email.types';
import { EmailValidation } from './Joi/emailValidations/email.joi';
import { ErrorConstants } from './constants';

export class EmailService {
  private emailClient: EmailClient;
  private envVars: EnvVars;
  private connectionString: string;
  private emailValidation: EmailValidation;
  constructor() {
    this.envVars = new EnvVars();
    this.connectionString = `endpoint=https://${this.envVars.get('ACS_RESOURCE_NAME')}.communication.azure.com/;accesskey=${this.envVars.get(
      'ACS_BASE64_ENCODED_KEY'
    )}`;
    this.emailClient = new EmailClient(this.connectionString);
    this.emailValidation = new EmailValidation();
  }

  static async generateToken(): Promise<string> {
    return crypto.randomBytes(32).toString('hex');
  }

  private getEmailTemplate(params: EmailParamsType) {
    return params.otp
      ? `
    <div style="font-family: Arial, sans-serif; line-height: 1.6;">
        <h2 style="color: #333;">Verify Your Email Address</h2>
        <p>SimpliShare</p>
        <p>Thank you for registering. Please use the OTP below to verify your email address:</p>
        <h3 style="background: #f3f3f3; padding: 10px; display: inline-block;">${params.otp}</h3>
        <p>This OTP will expire in 5 minutes.</p>
        <p>If you did not request this, please ignore this email.</p>
    </div>
`
      : `
    <div style="font-family: Arial, sans-serif; line-height: 1.6;">
        <h2 style="color: #333;">Reset Your Password</h2>
        <p>SimpliShare</p>
        <p>You have requested to reset your password. Click the link below to proceed:</p>
        <p>
            <a href="${params.resetPasswordLink}" style="background: #007bff; color: #fff; padding: 10px 20px; text-decoration: none; display: inline-block; border-radius: 5px;">
                Reset Password
            </a>
        </p>
        <p>If you did not request this, please ignore this email.</p>
    </div>`;
  }

  public async generateOTP(length: number = 4): Promise<string> {
    return crypto.randomInt(10 ** (length - 1), 10 ** length).toString();
  }

  public async hashToken(token: string): Promise<string> {
    return crypto.createHash('sha256').update(token).digest('hex');
  }

  public async verifyToken(clientToken: string, hashedToken: string): Promise<boolean> {
    const clientHashedToken = await this.hashToken(clientToken);
    return clientHashedToken === hashedToken;
  }

  public async sendEmail(params: EmailParamsType): Promise<EmailSendResponse> {
    return new Promise(async (resolve, reject) => {
      try {
        // validate the email data.
        await this.emailValidation.validate(params, EmailValidation.schemas.sendEmailSchema);

        // get email template based user request.
        const emailHtml = this.getEmailTemplate(params);

        const message = {
          senderAddress: this.envVars.get('ACS_USER_EMAIL'),
          recipients: { to: [{ address: params.recipient_email }] },
          content: {
            subject: params.subject,
            plainText: params.text,
            html: params.html || emailHtml
          }
        };

        const poller = await this.emailClient.beginSend(message);
        const response = await poller.pollUntilDone();
        resolve(response);
      } catch (error: any) {
        const acsError = error instanceof RestError;
        if (acsError) {
          reject(
            createError(500, {
              message: (error.details as any)?.error?.message,
              errorCode: ErrorConstants.ERROR_EMAIL_SEND_FAILED
            })
          );
        } else {
          reject(error);
        }
      }
    });
  }
}
