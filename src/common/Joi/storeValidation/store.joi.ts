import Joi, { ObjectSchema, ValidationErrorItem } from "joi";
import createError from "http-errors";
import { ErrorConstants } from "../../constants";
import { joiErrorMap } from "../joiErrorMap";

export class StoreValidation {
  public static schemas: Record<string, ObjectSchema> = {
    addStoreSchema: Joi.object({
      store_name: Joi.string().min(1).max(100).required(),
      store_type: Joi.string().required(),
      email_id: Joi.string().email().required(),
      manager_email_id: Joi.string().email().required(),
      address: Joi.string().min(5).required(),
      city: Joi.string().min(1).required(),
      state: Joi.string().min(1).required(),
      pincode: Joi.string().regex(/^\d{6}$/).required(),
    }),

    // Add the missing updateStoreSchema here
    updateStoreSchema: Joi.object({
      store_name: Joi.string().min(1).max(100).optional(),
      store_type: Joi.string().optional(),
      email_id: Joi.string().email().optional(),
      manager_email_id: Joi.string().email().optional(),
      address: Joi.string().min(5).optional(),
      city: Joi.string().min(1).optional(),
      state: Joi.string().min(1).optional(),
      pincode: Joi.string().regex(/^\d{6}$/).optional(),
    }).min(1), // .min(1) ensures at least one field is provided for the update
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