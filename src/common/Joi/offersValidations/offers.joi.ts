import Joi, { ObjectSchema, ValidationErrorItem } from "joi";
import createError from "http-errors";
import { ErrorConstants } from "../../constants";
import { joiErrorMap } from "../joiErrorMap";

export class OfferValidation {
  public static schemas: Record<string, ObjectSchema> = {
    addOfferSchema: Joi.object({
      store: Joi.string().required(),
      location: Joi.string().trim().required(),
      offerType: Joi.string().valid("Day Offers", "Offers By Value", "BOGO").required(),
      offerTitle: Joi.string().trim().required(),
      offerDescription: Joi.string().trim().required(),
      startDate: Joi.date().iso().required(),
      endDate: Joi.date().iso().required(),
      discountPercentage: Joi.number().min(0).max(100).optional(),
      minSpendAmount: Joi.number().min(0).optional(),
      couponCode: Joi.string().trim().optional(),
      selectOfferStatus: Joi.string().required(),
      applicableProducts: Joi.string().required(),
      offerImages: Joi.array().items(Joi.string()).optional(),
      audience: Joi.string().valid("Public", "Private").optional(),
      offerStatus: Joi.string().required(),
    }),

    updateOfferSchema: Joi.object({
      store: Joi.string().optional(),
      location: Joi.string().trim().optional(),
      offerType: Joi.string().valid("Day Offers", "Offers By Value", "BOGO").optional(),
      offerTitle: Joi.string().trim().optional(),
      offerDescription: Joi.string().trim().optional(),
      startDate: Joi.date().iso().optional(),
      endDate: Joi.date().iso().optional(),
      discountPercentage: Joi.number().min(0).max(100).optional(),
      minSpendAmount: Joi.number().min(0).optional(),
      couponCode: Joi.string().trim().optional(),
      selectOfferStatus: Joi.string().optional(),
      applicableProducts: Joi.string().optional(),
      offerImages: Joi.array().items(Joi.string()).optional(),
      audience: Joi.string().valid("Public", "Private").optional(),
      offerStatus: Joi.string().optional(),
    }).min(1),
  };

  private formatJoiErrors(errorDetails: ValidationErrorItem[]) {
    const formatErrors = errorDetails.map((detail) => {
      const field = detail.path.join(".");
      const type = detail.type;
      const map = joiErrorMap[type] || {
        errorCode: ErrorConstants.ERROR_INVALID_FIELD_FORMAT,
        message: "Invalid input.",
      };
      const regex = new RegExp("\\{#(\\w+)\\}", "g");
      const renderedMsg = map.message.replace(regex, (_, key) => {
        return detail.context?.[key] ?? "";
      });
      return {
        field,
        type,
        errorCode: map.errorCode,
        message: renderedMsg,
      };
    });
    return formatErrors;
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
