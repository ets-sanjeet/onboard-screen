import { NextFunction, Request, Response } from "express";
import { offerModel, IOffer } from "../models/offer.model";
import { storeModel, IStore } from "../models/store.model";
import createError from "http-errors";
import { ErrorConstants } from "../common/constants";
import Logger from "../common/logger";
import winston from "winston";
import { OfferValidation } from "../common/Joi/offersValidations/offers.joi";
import mongoose, { Types, PopulatedDoc } from "mongoose";
import { GridFSBucket } from "mongodb";


let gfsBucket: GridFSBucket;

const getGfsBucket = (): GridFSBucket => {
  if (!gfsBucket) {
   
    if (mongoose.connection.readyState !== 1) {
      throw new Error(
        "Mongoose connection is not established. Cannot initialize GridFSBucket."
      );
    }

 
    const dbInstance = mongoose.connection.db;

    if (!dbInstance) {
      throw new Error(
        "Mongoose DB instance is undefined. Check your MongoDB connection setup."
      );
    }


    gfsBucket = new mongoose.mongo.GridFSBucket(dbInstance, {
      bucketName: "offers_images", 
    });
  }
  return gfsBucket;
};


interface OfferRequest extends Request {
  files?:
    | Express.Multer.File[]
    | { [fieldname: string]: Express.Multer.File[] };
}




const saveBufferToGridFS = (file: Express.Multer.File): Promise<string> => {
  return new Promise((resolve, reject) => {
    try {
      const bucket = getGfsBucket();

      const uploadStream = bucket.openUploadStream(file.originalname, {
        contentType: file.mimetype,
        metadata: { originalName: file.originalname },
      });

      uploadStream.end(file.buffer);

      uploadStream.on("error", (error) => {
        console.error("[GRIDFS] Upload Error:", error);
        reject(createError(500, "File upload to storage failed."));
      });

      uploadStream.on("finish", () => {
        const fileId = uploadStream.id.toHexString();
        console.log(`[GRIDFS] Upload successful. ID: ${fileId}`);
        resolve(fileId);
      });
    } catch (error) {
      reject(error);
    }
  });
};


const deleteFileFromGridFS = async (fileId: string): Promise<void> => {
  try {
    const bucket = getGfsBucket();
    await bucket.delete(new Types.ObjectId(fileId));
    console.log(`[GRIDFS] Deletion successful for ID: ${fileId}`);
  } catch (error) {
    console.warn(
      `[GRIDFS] Deletion warning for ID: ${fileId}. Error: ${error}`
    );
  }
};

export class OfferController {
  private model = offerModel;
  private offerValidation: OfferValidation;
  private logger: winston.Logger;

  constructor() {
    this.offerValidation = new OfferValidation();
    this.logger = new Logger().createLogger();
  } 

  public getImage = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    const { fileId } = req.params;

    try {
      const bucket = getGfsBucket();
      const fileObjectId = new Types.ObjectId(fileId);

      const file = await bucket.find({ _id: fileObjectId }).next();

      if (!file) {
        throw createError(404, {
          message: "Image not found.",
          errorCode: ErrorConstants.ERROR_NOT_FOUND,
        });
      } 

      res.setHeader(
        "Content-Type",
        file.contentType || "application/octet-stream"
      );
      res.setHeader("Content-Length", file.length); 

      const downloadStream = bucket.openDownloadStream(fileObjectId);

      downloadStream.on("error", (err) => {
        this.logger.error("Error streaming image from GridFS:", err);
        if (!res.headersSent) {
          next(createError(500, "Error streaming file."));
        }
      });

      downloadStream.pipe(res);
    } catch (error: any) {
      if (error.name === "BSONTypeError") {
        next(createError(400, "Invalid file ID format."));
      } else {
        next(error);
      }
    }
  };
  public addOffer = async (
    req: OfferRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    const uploadedFiles = Array.isArray(req.files) ? req.files : undefined;

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

      let offerImageIds: string[] = [];
      if (uploadedFiles && uploadedFiles.length > 0) {
        const uploadPromises = uploadedFiles.map(saveBufferToGridFS);
        offerImageIds = await Promise.all(uploadPromises);
      }

      const newOffer = await this.model.create({
        ...offerData,
        store,
        offerImages: offerImageIds,
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

  public getOffers = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const userId = res.locals.userId;
      const stores = await storeModel.find({ user_id: userId }, { _id: 1 });
      const storeIds = stores.map((store) => store._id);

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

  public updateOffer = async (
    req: OfferRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    const uploadedFiles = Array.isArray(req.files) ? req.files : undefined;

    try {
      const userId = res.locals.userId;
      const { offer_id } = req.params;
      const updateFields = { ...req.body };

      const offerToUpdate = await this.model
        .findById(offer_id)
        .populate<{ store: PopulatedDoc<IStore & { _id: Types.ObjectId }> }>({
          path: "store",
          select: "user_id",
          model: storeModel,
        });

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

      await this.offerValidation.validate(
        req.body,
        OfferValidation.schemas.updateOfferSchema
      );

      const oldImageIds = offerToUpdate.offerImages || [];
      let imagesToDelete: string[] = [];

      if (uploadedFiles && uploadedFiles.length > 0) {
        
        const uploadPromises = uploadedFiles.map(saveBufferToGridFS);
        const newImageIds = await Promise.all(uploadPromises); 

        imagesToDelete = oldImageIds;
        updateFields.offerImages = newImageIds;
      }

      const updatedOffer = await this.model.findByIdAndUpdate(
        offer_id,
        { $set: updateFields },
        { new: true }
      ); 

      if (imagesToDelete.length > 0) {
        imagesToDelete.forEach(deleteFileFromGridFS);
      }

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

      offerToDelete.offerImages?.forEach(deleteFileFromGridFS);

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
