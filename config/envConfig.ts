import dotenv from 'dotenv';
import path from 'path';
import Joi from 'joi';
import createError from 'http-errors';
import { EnvVarsType } from '../src/common/interfaces/envVars.interface';

class EnvVars {
  private envFile: string;
  private envVarsObj: EnvVarsType;
  constructor() {
    this.envFile = process.env.NODE_ENV === 'development' ? '.env' : '.env.production';
    this.loadEnvFile();
    this.envVarsObj = this.validateEnvFile();
  }
  private loadEnvFile(): void {
    dotenv.config({
      path: path.resolve(__dirname, `../${this.envFile}`)
    });
  }
  private validateEnvFile(): EnvVarsType {
    const envVarsSchema = Joi.object()
      .keys({
        PORT: Joi.number().required(),
        MONGO_URL: Joi.string().required().description('MongoDB url'),
        DB_NAME: Joi.string().required().description('MongoDB database name.'),
        JWT_SECRET: Joi.string().required().description('JWT Secret key.'),
        ACS_RESOURCE_NAME: Joi.string().required().description('acs resource name'),
        ACS_BASE64_ENCODED_KEY: Joi.string().required().description('acs base64 encoded key'),
        ACS_USER_EMAIL: Joi.string().required().description('ACS user email'),
        MAX_FILE_SIZE: Joi.string().required().description('MAX FILE SIZE'),
        MAX_FILES_ROTATION: Joi.string().required().description('Max Age for Log Files'),
        LOG_LEVEL: Joi.string().required().description('add the log level')
      })
      .unknown();
    const validateObj = envVarsSchema.prefs({ errors: { label: 'key' } }).validate(process.env);
    if (validateObj.error) {
      throw createError(500, `Config Validation Error:${validateObj.error.message}`);
    }

    return {
      ...validateObj.value
    } as EnvVarsType;
  }
  public get<T extends keyof EnvVarsType>(key: T): EnvVarsType[T] {
    return this.envVarsObj[key];
  }
}

export default EnvVars;
