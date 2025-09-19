import { Document, Types } from "mongoose";

export interface IOffer extends Document {
  store: Types.ObjectId;

  location: string;

  offerType: "Day Offers" | "Offers By Value" | "BOGO";

  offerTitle: string;

  offerDescription: string;
  discountPercentage?: number;

  startDate: Date;

  endDate: Date;

  offerStatus: string;

  applicableProducts?: "Active" | "Paused" | "Expired";

  minSpendAmount?: number;
  couponCode?: string;
  offerImages?: string[];

  audience?: "Public" | "Private";
}
