import mongoose from 'mongoose';
import createError from 'http-errors';

class DatabaseClient {
  private connection: null | mongoose.Mongoose;
  constructor() {
    this.connection = null;
  }

  // This function will help us to connect the DB.
  connect(url: string, options: mongoose.ConnectOptions): Promise<mongoose.Mongoose> {
    if (!this.connection) {
      return new Promise(async (resolve, reject) => {
        try {
          if (!url || !options.dbName) {
            throw createError(400, 'env variables are not configured properly.Please Check Once.');
          }
          this.connection = await mongoose.connect(url, options);
          resolve(this.connection);
        } catch (error) {
          reject(error);
        }
      });
    } else {
      return Promise.resolve(this.connection);
    }
  }

  // this function will help us to disconnect from the DB.
  async disconnect(): Promise<void> {
    if (!this.connection) {
      throw createError(404, 'No active database connection to disconnect.');
    }
    try {
      await mongoose.disconnect();
      this.connection = null;
    } catch (error) {
      console.error('Database disconnection failed:', error);
      throw error;
    }
  }
}

export default DatabaseClient;
