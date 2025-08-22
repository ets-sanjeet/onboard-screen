import winston from "winston";
import DailyRotateFile from "winston-daily-rotate-file";
import path from "path";
import EnvVars from "../../config/envConfig";
import fs from "fs";
class Logger {
  private logger: winston.Logger | null;
  private envVars: EnvVars;
  private level: string;
  private myCustomLevels = {
    levels: {
      fatal: 0,
      error: 1,
      warn: 2,
      info: 3,
      debug: 4,
      trace: 5,
    },
    colors: {
      fatal: "redBG",
      error: "red",
      warn: "yellow",
      info: "green",
      debug: "blue",
      trace: "gray",
    },
  };
  private transports: winston.transport[] = [];

  constructor() {
    this.envVars = new EnvVars();
    this.level =
      this.envVars.get("LOG_LEVEL") ||
      (process.env.NODE_ENV === "production" ? "info" : "trace");
    this.logger = null;
    this.ensureLogDirectory();
    this.getTransports();
  }
  private ensureLogDirectory() {
    const logDir = path.resolve("logs");
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir);
    }
  }
  private getTransports() {
    const isDev = process.env.NODE_ENV === "development";

    const errorFormatter = winston.format((info) => {
      if (info instanceof Error) {
        return {
          ...info,
          message: info.message,
          stack: info.stack,
        };
      }

      if (info.message instanceof Error) {
        const error = info.message;
        return {
          ...info,
          message: error.message,
          stack: error.stack,
        };
      }

      return info;
    });

    const fileFormat = winston.format.combine(
      errorFormatter(),
      winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
      winston.format.json()
    );
    const consoleFormat = winston.format.combine(
      errorFormatter(),
      winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
      winston.format.printf(({ level, message, timestamp, stack }) => {
        // If there's a stack (i.e., it's an Error), show that too
        return stack
          ? `[${level}]: ${timestamp} ${message}\n${stack}`
          : `[${level}]: ${timestamp} ${message}`;
      }),
      winston.format.colorize({ all: true })
    );

    const transport1 = new DailyRotateFile({
      filename: "logs/app-%DATE%.log",
      datePattern: "YYYY-MM-DD",
      zippedArchive: true,
      maxSize: this.envVars.get("MAX_FILE_SIZE"),
      maxFiles: this.envVars.get("MAX_FILES_ROTATION"),
      format: fileFormat,
    });
    const transport2 = new DailyRotateFile({
      filename: "logs/error-%DATE%.log",
      level: "error",
      datePattern: "YYYY-MM-DD",
      zippedArchive: true,
      maxSize: this.envVars.get("MAX_FILE_SIZE"),
      maxFiles: this.envVars.get("MAX_FILES_ROTATION"),
      format: fileFormat,
    });
    if (isDev) {
      this.transports.push(
        new winston.transports.Console({
          format: consoleFormat,
        })
      );
    }
    this.transports.push(transport1, transport2);
  }

  public createLogger(): winston.Logger {
    if (!this.logger) {
      this.logger = winston.createLogger({
        level: this.level,
        levels: this.myCustomLevels.levels,
        transports: this.transports,
      });

      winston.addColors(this.myCustomLevels.colors);
    }
    return this.logger;
  }
}

export default Logger;
