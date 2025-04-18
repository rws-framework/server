
import 'reflect-metadata';

import { BootstrapRegistry } from '../../nest/decorators/RWSConfigInjector';
import IAppConfig from '../../src/types/IAppConfig';
import { INestApplication, Type } from '@nestjs/common';
import { CLIModule, NestModuleInputData, ParsedOptions } from './application/cli.module';
import { NestFactory } from '@nestjs/core';

import chalk from 'chalk';
import { DecoratorExplorerService, CMDProvider } from '../../src/services/DecoratorExplorerService';
import { UtilsService } from '../../src/services/UtilsService';
import { MD5Service } from '../../src/services/MD5Service';
import fs from 'fs';
import { ICommandBaseServices } from '../../src/commands/types';
import { ConsoleService } from '../../src/services/ConsoleService';
import { ProcessService } from '../../src/services/ProcessService';
import { NestDBService as DBService } from '../../src/services/NestDBService';
import { RWSBaseCommand } from '../../src/commands/_command';
import { RWSConfigService } from '../../src/services/RWSConfigService';
import { RWSModel } from '@rws-framework/db';

// console.log = (any) => {};

interface CLIServices { discoveryService: DecoratorExplorerService, utilsService: UtilsService, md5Service: MD5Service }

export class RWSCliBootstrap {
    protected static _instance: RWSCliBootstrap;
    protected $app: INestApplication;    
    constructor(protected nestModuleData: NestModuleInputData, protected module: Type<any> = null){}

    static async run<T extends IAppConfig>(       
        config: () => T, 
        nestModuleData: NestModuleInputData, 
        customModule: Type<any> = null
    ): Promise<void> {
        const commandName: string = process.argv[2];     
        try {          
            if (!this._instance) {
                this._instance = new RWSCliBootstrap(nestModuleData, customModule);
            }
            return this._instance.runCli(commandName, config());
        } catch (error) {
            console.error('Error in RWSCliBootstrap.run:', error);
            throw error;
        }
    }
    

    protected static get instance(): RWSCliBootstrap {
        return this._instance;
    }

    private async makeModule(): Promise<void> {
        try {                   
            const config = BootstrapRegistry.getConfig();
          
            this.module = await (CLIModule as any).forRoot(
                this.nestModuleData, 
                config
            );

            console.log(chalk.blue('CLI Module created successfully'));
        } catch (error) {
            console.error('Error in makeModule:', error);
            throw error;
        }
    }

    protected getServices(): CLIServices
    {
        const discoveryService = this.$app.get(DecoratorExplorerService);
        const utilsService = this.$app.get(UtilsService);
        const md5Service = this.$app.get(MD5Service);

        return {
            discoveryService, utilsService, md5Service
        };
    }

    async runCli(commandName: string, config: IAppConfig): Promise<void> {
        try {
          
            if (!BootstrapRegistry.isInitialized()) {
                BootstrapRegistry.setConfig(config);
            }

            await this.makeModule();        
            this.$app = await NestFactory.create(this.module);

            await this.$app.init();

            console.log(chalk.bgGreen('$APP is loaded.')); 

            const { discoveryService, utilsService, md5Service }: CLIServices = this.getServices();              

            const configService = this.$app.get(RWSConfigService);
            const dbService = this.$app.get(DBService);  
            
            RWSModel.setServices({configService, dbService: dbService.core()}); 

            const services: ICommandBaseServices = {
                utilsService: this.$app.get(UtilsService),
                configService: this.$app.get(RWSConfigService),
                consoleService: this.$app.get(ConsoleService),
                processService: this.$app.get(ProcessService),
                dbService: this.$app.get(DBService)
            };

            RWSBaseCommand.setServices(services);                    

            const cmdProviders = discoveryService.getCommandProviders();
            const cmdProvider: CMDProvider = cmdProviders[Object.keys(cmdProviders).find((item) => item === commandName)];

            const inputParams = process.argv.splice(3);
            const ignoredInputs: string[] = [];            
            
            const parsedOptions: ParsedOptions = inputParams.reduce<ParsedOptions>((acc: ParsedOptions, currentValue: string) => {
                if (currentValue.startsWith('--') || currentValue.startsWith('-')) {
                    const [key, value] = currentValue.replace(/^-+/, '').split('=');
                    ignoredInputs.push(currentValue); 
                
                    let theValue: string | boolean = value;

                    if(!value){
                        theValue = true;
                    }

                    return {
                        ...acc,
                        [key]: {
                            key: key,
                            value: theValue,
                            fullString: currentValue
                        }
                    };
                }
                return acc;
            }, {});

            const passedParams = inputParams.filter(item => !ignoredInputs.includes(item));           

            if(cmdProvider){          
                cmdProvider.instance.injectServices(services);
                if(configService.get('db_url')){
                    process.env.PRISMA_DB_URL = configService.get('db_url');
                }
                await cmdProvider.instance.run(passedParams, parsedOptions);
            } else {
                console.log(chalk.yellowBright(`Command "${commandName}" does not exist. Maybe you are looking for:`));

                for(const pk of Object.keys(cmdProviders)){
                    const provider: CMDProvider = cmdProviders[pk];
                    console.log(`"${utilsService.detectPackageManager() === 'yarn' ? 'yarn' : 'npx'} rws ${provider.metadata.options.name}": ${provider.metadata.options.description}`);
                }
            }            

            const cached: string | null = utilsService.getRWSVar('cli/paths');
            const cliPaths: string[] = cached ? cached.split('\n') : []; 
            const fileContents: string[] = [];

            for(const cliFile of cliPaths){
                fileContents.push(fs.readFileSync(cliFile, 'utf-8'));
            }

            utilsService.setRWSVar('cli/checksum', md5Service.md5(fileContents.join('\n')));             
        } catch (error) {
            console.error('Error in CLI bootstrap:', error);
            process.exit(1);
        }
    }
}
