import { NestFactory, Module } from '@rws-framework/server/nest';
import { AppConfigService, AppConfigModule, IAppConfig } from '@rws-framework/server';

import { DynamicModule } from '@nestjs/common';
import { IRWSModule, NestModulesType, RWSModuleType } from './types/IRWSModule';


@Module({})
export class RWSModule {
  static async forRoot(cfg: IAppConfig): Promise<DynamicModule> {
    const appContext = await NestFactory.createApplicationContext(AppConfigModule);
    const configService = (appContext.get(AppConfigService) as AppConfigService).init(cfg);
    const modules: RWSModuleType[] = configService.getModules();

    return {
      module: RWSModule,
      imports: modules as unknown as NestModulesType,
      providers: [AppConfigService],
    };
  }
}

export default async function bootstrap(cfg: IAppConfig) {
  const app = await NestFactory.create(RWSModule.forRoot(cfg));
  await app.listen(cfg.port);
}