import { Type, DynamicModule, ForwardReference } from '@nestjs/common';

export type NestModulesType = Array<Type<any> | DynamicModule | Promise<DynamicModule> | ForwardReference>;

export interface IRWSModule {

}

export type RWSModuleType = NestModulesType | IRWSModule;