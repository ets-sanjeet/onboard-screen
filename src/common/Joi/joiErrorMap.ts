import { ErrorConstants } from '../constants';

export const joiErrorMap: Record<string, { errorCode: number; message: string }> = {
  'any.required': {
    errorCode: ErrorConstants.ERROR_INVALID_FIELD_FORMAT,
    message: 'This field is required.'
  },
  'string.base': {
    errorCode: ErrorConstants.ERROR_INVALID_FIELD_FORMAT,
    message: 'This field must be a text string.'
  },
  'string.empty': {
    errorCode: ErrorConstants.ERROR_INVALID_FIELD_FORMAT,
    message: 'This field cannot be empty.'
  },
  'string.email': {
    errorCode: ErrorConstants.ERROR_INVALID_EMAIL_FORMAT,
    message: 'Please enter a valid email address.'
  },
  'string.alphanum': {
    errorCode: ErrorConstants.ERROR_INVALID_USER_NAME,
    message: 'Username can only contain letters and numbers.'
  },
  'string.min': {
    errorCode: ErrorConstants.ERROR_INVALID_FIELD_FORMAT,
    message: 'This field must have at least {#limit} characters.'
  },
  'string.max': {
    errorCode: ErrorConstants.ERROR_INVALID_FIELD_FORMAT,
    message: 'This field must not exceed {#limit} characters.'
  },
  'string.length': {
    errorCode: ErrorConstants.ERROR_INVALID_FIELD_FORMAT,
    message: 'This field must be exactly {#limit} characters.'
  }
};
