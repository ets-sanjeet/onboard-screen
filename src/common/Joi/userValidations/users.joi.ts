import Joi, { ObjectSchema, ValidationErrorItem } from "joi";
import createError from "http-errors";
import { ErrorConstants } from "../../constants";
import { joiErrorMap } from "../joiErrorMap";
export class UserValidation {
  public static schemas: Record<string, ObjectSchema> = {
    registerSchema: Joi.object({
      username: Joi.string().alphanum().min(3).max(30).required(),
      email: Joi.string().email().required(),
      password: Joi.string().min(8).required(),
    }),
    loginSchema: Joi.object({
      email: Joi.string().email().required(),
      password: Joi.string().required(),
    }),
    sendOTPSchema: Joi.object({
      email: Joi.string().email().required(),
      token: Joi.string().required(),
    }),
    verifyOTPSchema: Joi.object({
      email: Joi.string().email().required(),
      token: Joi.string().required(),
      otp: Joi.string().length(8).required(),
    }),
    forgotPasswordSchema: Joi.object({
      email: Joi.string().email().required(),
    }),
    onboardingSchema: Joi.object({
      first_name: Joi.string().min(1).max(50).required(),
      last_name: Joi.string().min(1).max(50).required(),
      profession: Joi.string()
        .valid("Brand Owner", "C Suit", "Franchaise Owner", "Freelancer")
        .required(),
      company_name: Joi.string().min(1).max(50).required(),
      industry: Joi.string().required(),
      team_size: Joi.string()
        .valid(
          "1-10",
          "11-50",
          "51-250",
          "251-1K",
          "1K-5K",
          "5K-10K",
          "10K-50K",
          "50K-100K",
          "100K+"
        )
        .required(),
      looking_for: Joi.string()
        .valid(
          "Brand Management",
          "Community Sharing",
          "Analyze & Insights",
          "Brand Strategy",
          "Brand Reputation"
        )
        .required(),
      is_onboarding_complete: Joi.boolean().required(),
      instagram_Connected: Joi.boolean().required(),

    }),
  };

  private formatJoiErrors(errorDetails: ValidationErrorItem[]) {
    const formatErros = errorDetails.map((detail, ind) => {
      const field = detail.path.join(".");
      const type = detail.type;
      const map = joiErrorMap[type] || {
        errorCode: ErrorConstants.ERROR_INVALID_FIELD_FORMAT,
        message: "Invalid input.",
      };

      const code =
        field === "password"
          ? ErrorConstants.ERROR_PASSWORD_TOO_SHORT
          : map.errorCode;
      const regex = new RegExp("\\{#(\\w+)\\}", "g");
      const renderedMsg = map.message.replace(regex, (_, key) => {
        return detail.context?.[key] ?? "";
      });
      return {
        field,
        type,
        errorCode: code,
        message: renderedMsg,
      };
    });
    return formatErros;
  }

  public async validate(data: any, schema: ObjectSchema) {
    try {
      await schema.validateAsync(data, {
        abortEarly: false,
      });
    } catch (error: any) {
      if (Joi.isError(error)) {
        throw createError(400, {
          message: "Validation Error",
          error: this.formatJoiErrors(error.details),
          errorCode: ErrorConstants.ERROR_INVALID_FIELD_FORMAT,
        });
      } else {
        throw createError(500, {
          message: `Internal Server Issue.`,
          errorCode: ErrorConstants.ERROR_SERVER_ERROR,
        });
      }
    }
  }
}
