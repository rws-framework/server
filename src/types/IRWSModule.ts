import { Type, DynamicModule, ForwardReference } from '@nestjs/common';
import IAppConfig from './IAppConfig';

export type NestModuleType = Type<any> | DynamicModule | Promise<DynamicModule> | ForwardReference;
export type NestModuleTypes = Array<NestModuleType>;

export interface IRWSModule {  
}

export type RWSModuleType = NestModuleType | IRWSModule;