export const SWAGGER_OPTIONS = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'SimpliShare API',
      version: '1.0.0',
      description: 'API documentation for SimpliShare'
    },
    servers: [
      {
        url: 'http://localhost:5000/',
        description: 'Development server'
      }
    ],
    components: {
      securitySchemes: {
        BearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      }
    },
    security: [
      {
        BearerAuth: []
      }
    ]
  },
  apis: ['./src/routers/*.ts']
};

export class ErrorConstants {
  // Validation Errors (3000-3099)
  static readonly ERROR_INVALID_EMAIL_FORMAT = 3000;
  static readonly ERROR_PASSWORD_TOO_SHORT = 3001;
  static readonly ERROR_INVALID_OTP = 3002;
  static readonly ERROR_INVALID_USER_NAME = 3003;
  static readonly ERROR_INVALID_FIELD_FORMAT = 3004;
  static readonly ERROR_ROUTE_NOT_FOUND = 3005;

  // Authentication Errors (3100-3199)
  static readonly ERROR_UNAUTHORIZED_ACCESS = 3100;
  static readonly ERROR_INVALID_TOKEN = 3101;
  static readonly ERROR_EXPIRED_TOKEN = 3102;
  static readonly ERROR_ACCESS_DENIED = 3103;
  static readonly ERROR_INVALID_CREDENTIALS = 3104;
  static readonly ERROR_ACCOUNT_NOT_VERIFIED = 3105;

  // Database Errors (3200-3299)
  static readonly ERROR_USER_NOT_FOUND = 3200;
  static readonly ERROR_DUPLICATE_ENTRY = 3201;
  static readonly ERROR_DATABASE_CONNECTION = 3202;
  static readonly ERROR_USER_DATA_NOT_FOUND = 3203;
  static readonly ERROR_STORE_NOT_FOUND = 3204; // Added this missing constant
  static readonly ERROR_NOT_FOUND = 3205; // Added this missing constant

  // Email Errors (3300-3399)
  static readonly ERROR_EMAIL_SEND_FAILED = 3300;
  static readonly ERROR_EMAIL_ALREADY_VERIFIED = 3301;

  // General Errors (3400-3499)
  static readonly ERROR_SERVER_ERROR = 3400;
}
