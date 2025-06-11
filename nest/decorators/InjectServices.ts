import { NestDBService as DBService } from '../../src/services/NestDBService';
import { ConfigService } from '@nestjs/config';

let globalDBService: DBService;
let globalConfigService: ConfigService;

export function setGlobalServices(dbService: DBService, configService: ConfigService) {
  globalDBService = dbService;
  globalConfigService = configService;
}

export function InjectServices() {
  return function (target: any) {
    
    return new Proxy(target, {
      get(target, prop, receiver) {
        if (prop === 'dbService') {
          return globalDBService;
        }
        if (prop === 'configService') {
          return globalConfigService;
        }
        return Reflect.get(target, prop, receiver);
      },
      set(target, prop, value, receiver) {
        if (prop === 'dbService') {
          globalDBService = value;
          return true;
        }
        if (prop === 'configService') {
          globalConfigService = value;
          return true;
        }
        return Reflect.set(target, prop, value, receiver);
      }
    });
  };
}