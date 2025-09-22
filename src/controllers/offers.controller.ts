import { NextFunction, Request, Response } from "express";
import { offerModel, IOffer } from "../models/offer.model";
import { storeModel, IStore } from "../models/store.model";
import createError from "http-errors";
import { ErrorConstants } from "../common/constants";
import Logger from "../common/logger";
import winston from "winston";
import { OfferValidation } from "../common/Joi/offersValidations/offers.joi";
import { Types, PopulatedDoc } from "mongoose";

export class OfferController {
  private model = offerModel;
  private offerValidation: OfferValidation;
  private logger: winston.Logger;

  constructor() {
    this.offerValidation = new OfferValidation();
    this.logger = new Logger().createLogger();
  }

  // Adds a new offer for a specific store.
  public addOffer = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const userId = res.locals.userId;
      const { store, ...offerData } = req.body;

      await this.offerValidation.validate(
        req.body,
        OfferValidation.schemas.addOfferSchema
      );

      const storeExists = await storeModel.findOne({
        _id: store,
        user_id: userId,
      });
      if (!storeExists) {
        throw createError(404, {
          message:
            "Store not found or you do not have permission to add an offer to it.",
          errorCode: ErrorConstants.ERROR_STORE_NOT_FOUND,
        });
      }

      // Create the new offer.
      const newOffer = await this.model.create({
        ...offerData,
        store: store,
      });

      res.locals.responseMessage.responseSuccess(
        req,
        res,
        201,
        "Offer has been successfully added.",
        { offer_id: newOffer._id, offer_title: newOffer.offerTitle },
        res.locals.requestId
      );
    } catch (error: any) {
      next(error);
    }
  };

  // Fetches all offers for all stores belonging to the authenticated user.
  public getOffers = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const userId = res.locals.userId;

      // Find all stores belonging to the user.
      const stores = await storeModel.find({ user_id: userId }, { _id: 1 });
      const storeIds = stores.map((store) => store._id);

      // Find all offers that belong to the user's stores.
      const offers = await this.model.find({ store: { $in: storeIds } });

      res.locals.responseMessage.responseSuccess(
        req,
        res,
        200,
        "Offers fetched successfully.",
        offers,
        res.locals.requestId
      );
    } catch (error) {
      next(error);
    }
  };

  // Updates an offer by its ID.
  public updateOffer = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const userId = res.locals.userId;
      const { offer_id } = req.params;

      const offerToUpdate = await this.model
        .findById(offer_id)
        .populate<{ store: PopulatedDoc<IStore & { _id: Types.ObjectId }> }>({
          path: "store",
          select: "user_id",
          model: storeModel,
        });

      // Check if the offer and its store exist, and if the user owns the store.
      if (
        !offerToUpdate ||
        !offerToUpdate.store ||
        (offerToUpdate.store as IStore).user_id.toString() !== userId
      ) {
        throw createError(404, {
          message:
            "Offer not found or you do not have permission to update it.",
          errorCode: ErrorConstants.ERROR_OFFER_NOT_FOUND,
        });
      }

      // Validate the request body.
      await this.offerValidation.validate(
        req.body,
        OfferValidation.schemas.updateOfferSchema
      );

      // Update the offer.
      const updatedOffer = await this.model.findByIdAndUpdate(
        offer_id,
        { $set: req.body },
        { new: true }
      );

      res.locals.responseMessage.responseSuccess(
        req,
        res,
        200,
        "Offer updated successfully.",
        updatedOffer,
        res.locals.requestId
      );
    } catch (error: any) {
      next(error);
    }
  };

  // Deletes an offer by its ID.
  public deleteOffer = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const userId = res.locals.userId;
      const { offer_id } = req.params;

      const offerToDelete = await this.model
        .findById(offer_id)
        .populate<{ store: PopulatedDoc<IStore & { _id: Types.ObjectId }> }>({
          path: "store",
          select: "user_id",
          model: storeModel,
        });

      // Check if the offer and its store exist, and if the user owns the store.
      if (
        !offerToDelete ||
        !offerToDelete.store ||
        (offerToDelete.store as IStore).user_id.toString() !== userId
      ) {
        throw createError(404, {
          message:
            "Offer not found or you do not have permission to delete it.",
          errorCode: ErrorConstants.ERROR_OFFER_NOT_FOUND,
        });
      }

      // Delete the offer.
      await this.model.findByIdAndDelete(offer_id);

      res.locals.responseMessage.responseSuccess(
        req,
        res,
        200,
        "Offer deleted successfully.",
        null,
        res.locals.requestId
      );
    } catch (error) {
      next(error);
    }
  };
}
