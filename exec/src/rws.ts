import { CommandFactory } from 'nest-commander';
import { BootstrapRegistry } from '../../nest/decorators/RWSConfigInjector';
import IAppConfig from '../../src/types/IAppConfig';
import { DiscoveryModule, DiscoveryService, ModulesContainer, NestFactory } from '@nestjs/core';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { RWSModule } from '../../src/runNest';
import { InitCommand } from '../../src/commands/init.command';
import { ConsoleService, DBService, ProcessService, UtilsService } from '../../src';
import { IRWSModule, NestModuleTypes, RWSModuleType } from '../../src/types/IRWSModule';


@Module({})
export class CLIModule {
    static async forRoot(config: IAppConfig) {
        // const appModule = await (config.module as any).forRoot(config, true);
        // const rwsModule = await RWSModule.forRoot(config, true);
        
        return {
          module: CLIModule,
          imports: [      
            ConfigModule.forRoot({
              isGlobal: true,
              load: [ () => config ]
            })
          ],
          providers: [     
            ProcessService,      
            DBService,
            ConfigService,
            UtilsService,
            ConsoleService,
            InitCommand
          ],
          exports: [
            ProcessService,
            DBService,
            ConfigService,
            UtilsService,
            ConsoleService,
            InitCommand
          ]
        };
    }
}

export class RWSCliBootstrap {
    private static _instance: RWSCliBootstrap;

    constructor(private module: RWSModuleType = null){}

    static async run(commandName: string, config: () => IAppConfig, customModule: RWSModuleType = null): Promise<void> {
        if (!this._instance) {
            this._instance = new RWSCliBootstrap(customModule);
        }
        return this._instance.runCli(commandName, config());
    }

    protected static get instance(): RWSCliBootstrap {
        return this._instance;
    }

    async runCli(commandName:string, config: IAppConfig): Promise<void> {
        try {
            if (!BootstrapRegistry.isInitialized()) {
                BootstrapRegistry.setConfig(config);
            }

            const app = await NestFactory.create(((this.module ? this.module : CLIModule) as any).forRoot(BootstrapRegistry.getConfig()));                       
            if(commandName === 'init'){
                const command: InitCommand = app.get(InitCommand);
                command.run(process.argv.slice(3));
            }
        } catch (error) {
            console.error('Error in CLI bootstrap:', error);
            process.exit(1);
        }
    }
}
