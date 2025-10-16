
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
import { BlackLogger } from '../../nest';

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

    /**
     * Common method to parse quoted strings from parameter arrays
     * Handles both regular parameters and option values
     */
    private parseQuotedString(params: string[], startIndex: number): { value: string; nextIndex: number } {
        const param = params[startIndex];
        
        // Check if parameter starts with a quote
        if (param.startsWith('"')) {
            const quotedParts = [param];
            let foundClosingQuote = param.endsWith('"') && param.length > 1;
            let nextIndex = startIndex + 1;
            
            if (!foundClosingQuote) {
                // Look for closing quote in subsequent parameters
                while (nextIndex < params.length && !foundClosingQuote) {
                    quotedParts.push(params[nextIndex]);
                    if (params[nextIndex].endsWith('"')) {
                        foundClosingQuote = true;
                    }
                    nextIndex++;
                }
            }
            
            if (foundClosingQuote) {
                // Join all parts and remove surrounding quotes
                const quotedParam = quotedParts.join(' ');
                return {
                    value: quotedParam.slice(1, -1), // Remove first and last quote
                    nextIndex
                };
            } else {
                // No closing quote found, treat as regular parameter without opening quote
                return {
                    value: param.slice(1), // Remove opening quote
                    nextIndex: startIndex + 1
                };
            }
        } else {
            // Regular parameter without quotes
            return {
                value: param,
                nextIndex: startIndex + 1
            };
        }
    }

    /**
     * Parse command line parameters with support for quoted strings
     * Handles both options (--key=value) and regular parameters
     */
    private parseParametersWithQuotes(inputParams: string[]): { parsedOptions: ParsedOptions; passedParams: string[] } {
        const parsedOptions: ParsedOptions = {};
        const passedParams: string[] = [];
        const ignoredInputs: string[] = [];
        
        let i = 0;
        while (i < inputParams.length) {
            const currentValue = inputParams[i];
            
            if (currentValue.startsWith('--') || currentValue.startsWith('-')) {
                // Handle options
                const [key, value] = currentValue.replace(/^-+/, '').split('=');
                ignoredInputs.push(currentValue);
                
                let theValue: string | boolean = value;
                
                if (!value) {
                    theValue = true;
                } else if (value.startsWith('"')) {
                    // Handle quoted option values
                    const fullOptionString = currentValue;
                    const valueStartIndex = fullOptionString.indexOf('=') + 1;
                    const valuePrefix = fullOptionString.substring(0, valueStartIndex);
                    const valueSuffix = fullOptionString.substring(valueStartIndex);
                    
                    // Create temporary array with just the value part for parsing
                    const tempParams = [valueSuffix];
                    let j = i + 1;
                    
                    // If the quoted value spans multiple parameters after the =
                    if (!valueSuffix.endsWith('"') || valueSuffix.length === 1) {
                        while (j < inputParams.length && !inputParams[j-1]?.endsWith('"')) {
                            tempParams.push(inputParams[j]);
                            ignoredInputs.push(inputParams[j]);
                            j++;
                        }
                    }
                    
                    const parsed = this.parseQuotedString(tempParams, 0);
                    theValue = parsed.value;
                    i = j - 1; // Skip consumed parameters
                }
                
                parsedOptions[key] = {
                    key: key,
                    value: theValue,
                    fullString: currentValue
                };
            } else {
                // Handle regular parameters
                const parsed = this.parseQuotedString(inputParams, i);
                passedParams.push(parsed.value);
                i = parsed.nextIndex - 1; // Will be incremented at end of loop
            }
            
            i++;
        }
        
        return { parsedOptions, passedParams };
    }

    async runCli(commandName: string, config: IAppConfig): Promise<void> {
        try {
          
            if (!BootstrapRegistry.isInitialized()) {
                BootstrapRegistry.setConfig(config);
            }

            BlackLogger.setConfig(config.logging);

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
            
            // Parse all parameters with quoted string support
            const { parsedOptions, passedParams } = this.parseParametersWithQuotes(inputParams);             
            
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
