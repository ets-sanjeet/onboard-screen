import { UserRole } from "../enums/user.enums";

// creating an interface representing a user document in Mongodb.
export interface IUser {
  username: string;
  email: string;
  password: string;
  roles: UserRole[];
  is_email_verified?: boolean;
  email_verification_otp?: string | null;
  email_verification_token?: string | null;
  email_verification_expires?: Date | null;
  email_verified_at?: Date;
  reset_password_token?: string | null;
  reset_token_expires?: Date | null;
  reset_password_verified_at?: Date;
  first_name?: string;
  last_name?: string;
  profession?: "Individual" | "Manager/Director" | "Executive" | "Franchise Owner";
  company_name?: string;
  industry?: string;
  team_size?: "1-10" | "11-50" | "51-250" | "251-1K" | "1K-5K" | "5K-10K" | "10K-50K" | "50K-100K" | "100K+";
  looking_for?: "Brand Management" | "Community Sharing" | "Analyze & insights" | "Brand Strategy" | "Brand Reputation";
  instagram_Connected?: boolean;
  is_onboarding_complete?:boolean;

}
