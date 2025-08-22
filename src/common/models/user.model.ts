
import { CallbackError, model, Schema } from "mongoose";
import { IUser } from "../interfaces/user.interface";
import { UserRole } from "../enums/user.enums";
import bcrypt from "bcrypt";

const userSchema = new Schema<IUser>(
  {
    username: {
      type: String,
      unique: true,
      required: false
    },
    email: {
      type: String,
      unique: true,
      required: true,
    },
    password: {
      type: String,
      required: false
    },
    roles: {
      type: [String],
      enum: Object.values(UserRole),
      default: [UserRole.USER],
    },
    is_email_verified: {
      type: Boolean,
      required: false,
      default: false,
    },
    email_verification_otp: {
      type: String,
      required: false,
      default: null,
    },
    email_verification_token: {
      type: String,
      required: false,
      default: null,
    },
    email_verification_expires: {
      type: Date,
      required: false,
      default: null,
    },
    email_verified_at: {
      type: Date,
      required: false,
      default: null,
    },
    reset_password_token: {
      type: String,
      required: false,
      default: null,
    },
    reset_token_expires: {
      type: Date,
      required: false,
      default: null,
    },
    reset_password_verified_at: {
      type: Date,
      required: false,
      default: null,
    },
    first_name: {
      type: String,
      required: false,
      default: null,
    },
    last_name: {
      type: String,
      required: false,
    },
    profession: {
      type: String,
      enum: ["Brand Owner", "C Suit", "Franchaise Owner", "Freelancer"],
      required: false,
      default: null,
    },
    company_name: {
      type: String,
      required: false,
      default: null,
    },
    industry: {
      type: String,
      required: false,
      default: null,
    },
    team_size: {
      type: String,
      enum: [
        "1-10",
        "11-50",
        "51-250",
        "251-1K",
        "1K-5K",
        "5K-10K",
        "10K-50K",
        "50K-100K",
        "100K+",
      ],
      required: false,
      default: null,
    },
    looking_for: {
      type: String,
      enum: [
        "Brand Management",
        "Community Sharing",
        "Analyze & Insights",
        "Brand Strategy",
        "Brand Reputation",
      ],
      required: false,
      default: null,
    },
    is_onboarding_complete: {
      type: Boolean,
      default: false,
    },
    instagram_Connected:{
      type:Boolean,
      default:false,
    }
  },
  { timestamps: true, versionKey: false }
);

userSchema.pre("save", async function (next) {
  if (this.isModified("password")) {
    try {
      const salt = await bcrypt.genSalt(10);
      this.password = await bcrypt.hash(this.password, salt);
    } catch (error) {
      return next(error as CallbackError);
    }
    next();
  }
});

export const userModel = model<IUser>("users", userSchema);
