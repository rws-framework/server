import { Injectable, LoggerService, Scope, Logger as BaseLogger } from '@nestjs/common';
import * as winston from 'winston';
import LokiTransport from 'winston-loki';
import { RWSConfigService } from '../src/services/RWSConfigService';
import IAppConfig from '../src/types/IAppConfig';
import { skip } from 'node:test';

@Injectable({ scope: Scope.TRANSIENT })
export class BlackLogger extends BaseLogger implements LoggerService {
  protected context?: string = 'APP';
  private winstonLogger: winston.Logger;
  private static config: IAppConfig['logging'];
  private cfg: IAppConfig['logging'];

  private winstonEnabled: boolean = true;

  constructor(context?: string) {
    super(context);
    this.context = context;

    this.cfg = BlackLogger.config;

    if (!this.cfg) {
      return;
    }

    const skipConsoleFilter = winston.format((info) => {      
      if (info.skipConsole) {
        return false;
      }

      return info;
    });

    const lokiCfg = {
      host: this.cfg.loki_url,
      labels: {
        app: this.cfg.app_name || 'nestjs',
        environment: this.cfg.environment || 'development',
        context: ''
      },
      replaceTimestamp: true,
      onConnectionError: (err: Error) => console.error('Loki Transport Error:', err)
    };

    const lokiTransport = new LokiTransport(lokiCfg);

    this.winstonLogger = winston.createLogger({
      level: this.cfg.log_level || 'info',
      format: winston.format.combine(
        winston.format((info) => {
          if (info.context) { info.labels = info.labels || {}; (info.labels as { context: string }).context = info.context as string; }
          return info;
        })(),
        winston.format.timestamp({
          format: 'YYYY-MM-DD HH:mm:ss'
        }),
        winston.format.errors({ stack: true }),
        winston.format.splat(),
        winston.format.json()
      ),
      defaultMeta: {
        service: this.cfg.service_name || 'api',
        pid: process.pid
      },
      transports: [
        new winston.transports.Console({
          format: winston.format.combine(
            skipConsoleFilter(),
            winston.format.timestamp({
              format: 'YYYY-MM-DD, HH:mm:ss'
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

  static setConfig(cfg: IAppConfig['logging']) {
    BlackLogger.config = cfg;
  }

  disableWinston() {
    this.winstonEnabled = false;
  }

  enableWinston() {
    this.winstonEnabled = true;
  }

  log(message: unknown, context?: string, hidden: boolean = false): void {
    const formattedMessage = this.formatMessage(message);
    const safeContext = (context || this.context || '').toString();

    const winstonParams: Record<string, unknown> = { context: safeContext, skipConsole: hidden };

    if(typeof message == 'object'){
      winstonParams.payload = message;
    }

    if (!this.cfg || !this.winstonEnabled) {
      super.log(formattedMessage, safeContext)
      return;
    }

    this.winstonLogger.info(formattedMessage, winstonParams);
  }

  error(message: unknown, trace?: string, context?: string): void {
    const formattedMessage = this.formatMessage(message);
    const safeContext = (context || this.context || '').toString();
    super.error(formattedMessage, trace);
    if (!this.cfg || !this.winstonEnabled) {
      return;
    }
    this.winstonLogger.error(formattedMessage, { context: safeContext, trace });
  }

  warn(message: unknown, context?: string): void {
    const formattedMessage = this.formatMessage(message);
    const safeContext = (context || this.context || '').toString();
    // super.warn(formattedMessage);
    if (!this.cfg || !this.winstonEnabled) {
      super.warn(formattedMessage);
      return;
    }
    this.winstonLogger.warn(formattedMessage, { context: safeContext });
  }

  debug(message: unknown, context?: string): void {
    const formattedMessage = this.formatMessage(message);
    const safeContext = (context || this.context || '').toString();
    super.debug(formattedMessage);
    if (!this.cfg || !this.winstonEnabled) {
      return;
    }
    this.winstonLogger.debug(formattedMessage, { context: safeContext });
  }

  verbose(message: unknown, context?: string): void {
    const formattedMessage = this.formatMessage(message);
    const safeContext = (context || this.context || '').toString();
    super.verbose(formattedMessage);
    if (!this.cfg || !this.winstonEnabled) {
      return;
    }
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
      return '';
    }
    return String(message);
  }

  setContext(context: string) {
    this.context = context;
  }
}
