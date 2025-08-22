import express, { Application, NextFunction, Request, Response } from 'express';
import EnvVars from '../config/envConfig';
import DatabaseClient from './common/cosmosDB';
import createError from 'http-errors';
import { ErrorConstants, SWAGGER_OPTIONS } from '../src/common/constants';
import swaggerJSDoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import Logger from '../src/common/logger';
import { requestIdMiddleware } from './middlewares/requestId';
import { requestMessageMiddleware } from './middlewares/responseMessage';
import { Server } from 'http';

const app: Application = express();
const v1Routes = require('./routers');
const cors = require('cors');

// create an environmental variable instance.
const envVarsInstance = new EnvVars();

// create an instance of logger class
const loggerInstance = new Logger();

// create a logger obj.
const logger = loggerInstance.createLogger();

// Use the request ID middleware before all routes.
app.use(requestIdMiddleware);

// Use this for a structured response format.
app.use(requestMessageMiddleware);

// CORS enables secure cross-origin requests between web applications
app.use(cors());

// Middleware to parse JSON bodies
app.use(express.json());

// Middleware to parse URL-encoded bodies
app.use(express.urlencoded({ extended: true }));

//Import Swagger configuration options from the constants file
const swaggerSpec = swaggerJSDoc(SWAGGER_OPTIONS);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// health-check api , to test whether the server is running or not.
app.get('/health-check', function (req: Request, res: Response) {
  res.send('Hello world !!.');
});

// version1 route handlers
app.use('/api/v1', v1Routes);

// Handle 404 errors (Unknown Routes)
app.use((req: Request, res: Response, next: NextFunction) => {
  next(createError(404, { message: `Route ${req.method} ${req.url} not found`, errorCode: ErrorConstants.ERROR_ROUTE_NOT_FOUND }));
});

// Global Error Handling Middleware
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  const statusCode = err.status || 500;
  //console.error(`[${new Date().toISOString()}] ${req.method} ${req.url} - ${err.message}`);
  res.locals.responseMessage.responseError(req, res, statusCode, err.message, err.error || null, err.errorCode, res.locals.requestId);
});

let server: Server;

async function main() {
  try {
    const DatabaseClientInstance = new DatabaseClient();

    await DatabaseClientInstance.connect(envVarsInstance.get('MONGO_URL'), { dbName: envVarsInstance.get('DB_NAME') });

    logger.info('Database Connected Successfully.');

    // Specifies the port number on which the application will run.
    const port = envVarsInstance.get('PORT');

    // Run the server in local Environment.
    server = app.listen(port, () => {
      logger.info(`server is listening on http://localhost:${port}/`);
    });
  } catch (error: any) {
    //logger.error('error', error);
    throw createError(500, { message: `Database Connection Failed: ${error.message}` });
  }
}

main();

const exitHandler = () => {
  if (server) {
    server.close(() => {
      logger.info('Server Closed');
      process.exit(1);
    });
  } else {
    process.exit(1);
  }
};

const unexpectedErrorHandler = (error: any) => {
  logger.error('SERVER CLOSED : ', error);
  exitHandler();
};

process.on('uncaughtException', unexpectedErrorHandler);
process.on('unhandledRejection', unexpectedErrorHandler);
