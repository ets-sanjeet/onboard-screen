import { NextFunction, Request, Response } from "express";
import { storeModel, IStore } from "../models/store.model";
import { StoreValidation } from "../common/Joi/storeValidation/store.joi";
import createError from "http-errors";
import { ErrorConstants } from "../common/constants";
import Logger from "../common/logger";
import winston from "winston";

export class StoreController {
  private model = storeModel;
  private storeValidation: StoreValidation;
  private logger: winston.Logger;

  constructor() {
    this.storeValidation = new StoreValidation();
    this.logger = new Logger().createLogger();
  }

  // Adds a new store for the authenticated user.
  public addStore = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      // Get the user ID from the authenticated token (set by auth middleware)
      const userId = res.locals.userId;

      if (!userId) {
        throw createError(401, {
          message: "Authentication required.",
          errorCode: ErrorConstants.ERROR_UNAUTHORIZED_ACCESS,
        });
      }

      // Validate the request body
      await this.storeValidation.validate(
        req.body,
        StoreValidation.schemas.addStoreSchema
      );

      const newStore = await this.model.create({
        ...req.body,
        user_id: userId,
      });

      res.locals.responseMessage.responseSuccess(
        req,
        res,
        201,
        "Store has been successfully added.",
        {
          store_id: newStore._id,
          store_name: newStore.store_name,
        },
        res.locals.requestId
      );
    } catch (error: any) {
      if (error.code === 11000) {
        // Mongoose duplicate key error (relies on unique index in the model)
        next(
          createError(409, {
            message: "A store with this email is already in use.",
            errorCode: ErrorConstants.ERROR_DUPLICATE_ENTRY,
          })
        );
      } else {
        next(error);
      }
    }
  };

  // Fetches all stores for the authenticated user.
  public getStores = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const userId = res.locals.userId;
      if (!userId) {
        throw createError(401, {
          message: "Authentication required.",
          errorCode: ErrorConstants.ERROR_UNAUTHORIZED_ACCESS,
        });
      }

      const stores = await this.model.find({ user_id: userId });

      res.locals.responseMessage.responseSuccess(
        req,
        res,
        200,
        "Stores fetched successfully.",
        stores,
        res.locals.requestId
      );
    } catch (error) {
      next(error);
    }
  };

  // Updates a store by its ID.
  public updateStore = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const userId = res.locals.userId;
      const { store_id } = req.params;

      if (!userId) {
        throw createError(401, {
          message: "Authentication required.",
          errorCode: ErrorConstants.ERROR_UNAUTHORIZED_ACCESS,
        });
      }

      // Validate the request body
      await this.storeValidation.validate(
        req.body,
        StoreValidation.schemas.updateStoreSchema
      );

      const updatedStore = await this.model.findOneAndUpdate(
        { _id: store_id, user_id: userId },
        { $set: req.body },
        { new: true } // Return the updated document
      );

      if (!updatedStore) {
        throw createError(404, {
          message: "Store not found or you do not have permission to update it.",
          errorCode: ErrorConstants.ERROR_STORE_NOT_FOUND,
        });
      }

      res.locals.responseMessage.responseSuccess(
        req,
        res,
        200,
        "Store updated successfully.",
        updatedStore,
        res.locals.requestId
      );
    } catch (error: any) {
      if (error.code === 11000) {
        next(
          createError(409, {
            message: "A store with this email is already in use.",
            errorCode: ErrorConstants.ERROR_DUPLICATE_ENTRY,
          })
        );
      } else {
        next(error);
      }
    }
  };

  // Deletes a store by its ID.
  public deleteStore = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const userId = res.locals.userId;
      const { store_id } = req.params;

      if (!userId) {
        throw createError(401, {
          message: "Authentication required.",
          errorCode: ErrorConstants.ERROR_UNAUTHORIZED_ACCESS,
        });
      }

      const store = await this.model.findOneAndDelete({
        _id: store_id,
        user_id: userId,
      });

      if (!store) {
        throw createError(404, {
          message: "Store not found or you do not have permission to delete it.",
          errorCode: ErrorConstants.ERROR_STORE_NOT_FOUND,
        });
      }

      res.locals.responseMessage.responseSuccess(
        req,
        res,
        200,
        "Store deleted successfully.",
        null,
        res.locals.requestId
      );
    } catch (error) {
      next(error);
    }
  };
}