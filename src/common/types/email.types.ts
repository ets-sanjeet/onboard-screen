// Type definition for email parameters, supporting both plain text and HTML formats.
export type EmailParamsType = {
  recipient_email: string;
  subject: string;
  text?: string;
  html?: string;
  otp?: string;
  resetPasswordLink?: string;
};
