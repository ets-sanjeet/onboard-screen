import Joi, { ObjectSchema, ValidationErrorItem } from 'joi';
import createError from 'http-errors';
import { ErrorConstants } from '../../constants';
import { joiErrorMap } from '../joiErrorMap';
export class EmailValidation {
  public static schemas: Record<string, ObjectSchema> = {
    sendEmailSchema: Joi.object({
      recipient_email: Joi.string().email().required().description('Recipient email address'),
      subject: Joi.string().required().description('Email subject line'),
      text: Joi.string().optional().min(10).description('Plain text email content (minimum 10 characters)'),
      html: Joi.string().optional().description('HTML formatted email content'),
      otp: Joi.string().optional().description('One-Time Password for verification'),
      resetPasswordLink: Joi.string().optional().description('Reset password link for account recovery')
    })
  };

  private formatJoiErrors(errorDetails: ValidationErrorItem[]) {
    const formatErros = errorDetails.map((detail, ind) => {
      const field = detail.path.join('.');
      const type = detail.type;
      const map = joiErrorMap[type] || {
        errorCode: ErrorConstants.ERROR_INVALID_FIELD_FORMAT,
        message: 'Invalid input.'
      };

      const code = field === 'password' ? ErrorConstants.ERROR_PASSWORD_TOO_SHORT : map.errorCode;
      const regex = new RegExp('\\{#(\\w+)\\}', 'g');
      const renderedMsg = map.message.replace(regex, (_, key) => {
        return detail.context?.[key] ?? '';
      });
      return {
        field,
        type,
        errorCode: code,
        message: renderedMsg
      };
    });
    return formatErros;
  }

  public async validate(data: any, schema: ObjectSchema) {
    try {
      await schema.validateAsync(data, {
        abortEarly: false
      });
    } catch (error: any) {
      if (Joi.isError(error)) {
        throw createError(400, {
          message: 'Validation Error',
          error: this.formatJoiErrors(error.details),
          errorCode: ErrorConstants.ERROR_INVALID_FIELD_FORMAT
        });
      } else {
        throw createError(500, { message: `Internal Server Issue.`, errorCode: ErrorConstants.ERROR_SERVER_ERROR });
      }
    }
  }
}
