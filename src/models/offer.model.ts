import { model, Schema, Document, Types } from "mongoose";

export interface IOffer extends Document {
  store: Types.ObjectId;
  location: string;
  offerType: "Day Offers" | "Offers By Value" | "BOGO";
  offerTitle: string;
  offerDescription: string;
  startDate: Date;
  endDate: Date;
  discountPercentage?: number;
  minSpendAmount?: number;
  couponCode?: string;
  selectOfferStatus: string;
  applicableProducts: string;
  offerImages?: string[];     
  audience?: "Public" | "Private";
  offerStatus: string;
}

const offerSchema = new Schema<IOffer>(
  {
    store: {
      type: Schema.Types.ObjectId,
      ref: "stores",
      required: true,
    },
    location: { type: String, required: true, trim: true },
    offerType: {
      type: String,
      enum: ["Day Offers", "Offers By Value", "BOGO"],
      required: true,
    },
    offerTitle: { type: String, required: true, trim: true },
    offerDescription: { type: String, required: true, trim: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    discountPercentage: { type: Number, min: 0, max: 100 },
    minSpendAmount: { type: Number, min: 0 },
    couponCode: { type: String, trim: true },
    selectOfferStatus: { type: String, required: true },
    applicableProducts: { type: String, required: true },
    offerImages: [{ type: String }],
    audience: {
      type: String,
      enum: ["Public", "Private"],
      default: "Public",
    },
    offerStatus: { type: String, required: true }, 
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

export const offerModel = model<IOffer>("offers", offerSchema);
