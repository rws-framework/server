import { Logger, Injectable, LoggerService, LogLevel, Scope } from '@nestjs/common';
import IAppConfig from '../types/IAppConfig';
import { ConfigService } from '@nestjs/config';

@Injectable({ scope: Scope.TRANSIENT })
export class RWSLogger implements LoggerService {  

  constructor(private configService: ConfigService, private logger: Logger) {}

  log(message: any, ...optionalParams: any[]) {    
    console.log('.');
    if (message.includes('[RouterExplorer]')) {
      return;
    }

    this.logger.log(message, ...optionalParams);
  }

  error(message: any, ...optionalParams: any[]) {
    this.logger.error(message, ...optionalParams);
  }

  warn(message: any, ...optionalParams: any[]) {
    this.logger.warn(message, ...optionalParams);
  }

  debug(message: any, ...optionalParams: any[]) {
    this.logger.debug(message, ...optionalParams);
  }

  verbose(message: any, ...optionalParams: any[]) {
    this.logger.log(message, ...optionalParams);
  }
}