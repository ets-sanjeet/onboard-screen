// defines the interface for the Environmental Variable .
export interface EnvVarsType {
  PORT: number;
  MONGO_URL: string;
  DB_NAME: string;
  JWT_SECRET: string;
  ACS_RESOURCE_NAME: string;
  ACS_BASE64_ENCODED_KEY: string;
  ACS_USER_EMAIL: string;
  MAX_FILE_SIZE: string;
  MAX_FILES_ROTATION: string;
  LOG_LEVEL: string;
}
