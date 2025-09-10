import { model, Schema, Document } from "mongoose";


export interface IStore extends Document {
  user_id: Schema.Types.ObjectId;
  store_name: string;
  store_type: string;
  email_id: string;
  manager_email_id: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
}

const storeSchema = new Schema<IStore>(
  {
    user_id: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "users", // Reference to the User model
    },
    store_name: {
      type: String,
      required: true,
      trim: true,
    },
    store_type: {
      type: String,
      required: true,
    },
    email_id: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    manager_email_id: {
      type: String,
      required: true,
      trim: true,
    },
    address: {
      type: String,
      required: true,
      trim: true,
    },
    city: {
      type: String,
      required: true,
      trim: true,
    },
    state: {
      type: String,
      required: true,
      trim: true,
    },
    pincode: {
      type: String,
      required: true,
      trim: true,
    },
  },
  { timestamps: true, versionKey: false }
);

export const storeModel = model<IStore>("stores", storeSchema);
