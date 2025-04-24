import { Injectable, LoggerService, Scope, Logger as BaseLogger } from '@nestjs/common';
import * as winston from 'winston';
import LokiTransport from 'winston-loki';

@Injectable({ scope: Scope.TRANSIENT })
export class BlackLogger extends BaseLogger implements LoggerService {
  protected context?: string;
  private winstonLogger: winston.Logger;

  constructor(context?: string) {
    super(context);
    this.context = context;
    
    const lokiTransport = new LokiTransport({
      host: process.env.LOKI_URL,
      labels: { 
        app: process.env.APP_NAME || 'nestjs',
        environment: process.env.NODE_ENV || 'development'
      },
      json: true,
      format: winston.format.json(),
      replaceTimestamp: true,
      onConnectionError: (err) => console.error('Loki Transport Error:', err)
    });
    
    this.winstonLogger = winston.createLogger({
      level: process.env.LOG_LEVEL || 'info',
      format: winston.format.combine(
        winston.format.timestamp({
          format: 'YYYY-MM-DD HH:mm:ss'
        }),
        winston.format.errors({ stack: true }),
        winston.format.splat(),
        winston.format.json()
      ),
      defaultMeta: { 
        service: process.env.SERVICE_NAME || 'api',
        pid: process.pid
      },
      transports: [
        new winston.transports.Console({
          format: winston.format.combine(
            winston.format.timestamp({
              format: 'MM/DD/YYYY, HH:mm:ss'
            }),
            winston.format.printf(info => {
              const timestamp = info.timestamp;
              const level = info.level.toUpperCase().padEnd(5);
              const context = info.context ? `[${info.context}]` : '';
              const message = info.message;
              const pid = info.pid || process.pid;
              const pidStr = String(pid).padStart(4);
              
              // Apply ANSI colors manually
              const yellow = '\x1b[33m';
              const blue = '\x1b[34m';
              const red = '\x1b[31m';
              const green = '\x1b[32m';
              const magenta = '\x1b[35m';
              const reset = '\x1b[0m';
              
              // Map log levels to colors
              const levelColors = {
                ERROR: red,
                WARN: yellow,
                INFO: green,
                DEBUG: magenta,
                VERBOSE: blue
              };
              
              const levelColor = levelColors[level.trim() as keyof typeof levelColors] || blue;
              
              return `${yellow}[Black] ${pidStr}  -${reset} ${timestamp}   ${levelColor}${level}${reset} ${yellow}${context}${reset} ${levelColor}${message}${reset}`;
            })
          )
        }),
        lokiTransport
      ]
    });
  }

  log(message: unknown, context?: string): void {
    const formattedMessage = this.formatMessage(message);
    const safeContext = (context || this.context || '').toString();
    // super.log(formattedMessage, safeContext);
    this.winstonLogger.info(formattedMessage, { context: safeContext });
  }

  error(message: unknown, trace?: string, context?: string): void {
    const formattedMessage = this.formatMessage(message);
    const safeContext = (context || this.context || '').toString();
    super.error(formattedMessage, trace);
    this.winstonLogger.error(formattedMessage, { context: safeContext, trace });
  }

  warn(message: unknown, context?: string): void {
    const formattedMessage = this.formatMessage(message);
    const safeContext = (context || this.context || '').toString();
    // super.warn(formattedMessage);
    this.winstonLogger.warn(formattedMessage, { context: safeContext });
  }

  debug(message: unknown, context?: string): void {
    const formattedMessage = this.formatMessage(message);
    const safeContext = (context || this.context || '').toString();
    super.debug(formattedMessage);
    this.winstonLogger.debug(formattedMessage, { context: safeContext });
  }

  verbose(message: unknown, context?: string): void {
    const formattedMessage = this.formatMessage(message);
    const safeContext = (context || this.context || '').toString();
    super.verbose(formattedMessage);
    this.winstonLogger.verbose(formattedMessage, { context: safeContext });
  }

  private formatMessage(message: unknown): string {
    if (message === null || message === undefined) {
      return '';
    }
    if (typeof message === 'string') {
      return message;
    }
    if (message instanceof Error) {
      return message.message;
    }
    if (typeof message === 'object') {
      try {
        return JSON.stringify(message);
      } catch {
        return Object.prototype.toString.call(message);
      }
    }
    return String(message);
  }

  setContext(context: string) {
    this.context = context;
  }
}
