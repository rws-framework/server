import 'reflect-metadata'; 
import { ConsoleService } from '../services/ConsoleService';
import { UtilsService } from '../services/UtilsService';
import { ConfigService } from '@nestjs/config';
import { ProcessService } from '../services/ProcessService';
import { DBService } from '../services/DBService';
import RWSModel from '../models/_model';
import path from 'path';
import { Injectable } from '@nestjs/common';
import { ParsedOptions } from '../../exec/src/application/cli.module';
import fs from 'fs';
import chalk from 'chalk';
import { rwsPath } from '@rws-framework/console';

const COMMAND_DECORATOR_META_KEY = 'rws:command';

@Injectable()
export abstract class RWSBaseCommand{
    protected packageRootDir: string;
    protected executionDir: string;  
    
    constructor(
      protected readonly utilsService: UtilsService,
      protected readonly consoleService: ConsoleService,
      protected readonly configService: ConfigService,
      protected readonly processService: ProcessService,    
      protected readonly dbService: DBService  
    ) {    
      this.executionDir = process.cwd();
      this.packageRootDir = this.utilsService.findRootWorkspacePath(__dirname);
      

      RWSModel.dbService = dbService;
      RWSModel.configService = configService;
    }    

    abstract run(
      passedParams: string[],
      options: ParsedOptions,
    ): Promise<void>;
}

export interface IRWSCliCmdOpts {
  name: string,
  description?: string
}

export type CmdMetadataType = { options: IRWSCliCmdOpts, _IS_CMD: true } | null | undefined

const RWSCommand = (cmdOpts: IRWSCliCmdOpts) => {
  const packageJson: {
    name: string
  } = JSON.parse(fs.readFileSync(path.resolve(process.cwd(), 'package.json'), 'utf-8'));

  return (target: any, prop: string = null) => {
    const metadata: CmdMetadataType = { options: cmdOpts, _IS_CMD: true };
    Reflect.defineMetadata(COMMAND_DECORATOR_META_KEY, metadata, target);
    
    const stack = new Error().stack;
    const stackLines = stack.split('\n');
    
    const commandLines = stackLines.filter(line => 
      line.indexOf('_command.ts') === -1
    );      

    commandLines.forEach(line => {
      if (line.includes(`webpack:/${packageJson.name}/`)) {
        const webpackPath = line.split(`webpack:/${packageJson.name}/`)[1];
        if (webpackPath && webpackPath.includes('.ts')) {
          let commandPath = webpackPath.split('.ts')[0] + '.ts';
          let resolvedPath = path.resolve(commandPath);

          if(!fs.existsSync(resolvedPath)){      
            commandPath = path.resolve(rwsPath.findRootWorkspacePath(), commandPath);
            resolvedPath = path.resolve(commandPath);            
          }         

          if(fs.existsSync(resolvedPath)){
            const cached: string | null = UtilsService.getRWSVar('cli/paths');
            const cliPaths: string[] = cached ? cached.split('\n') : []; 

            let newCliPaths: string[] = cliPaths.length ? cliPaths : [];

            if(!newCliPaths.includes(resolvedPath)){
              UtilsService.setRWSVar(`cli/paths`, [...newCliPaths, resolvedPath].join('\n'));
            }             
          }                    
        }
      }
    });
  }
}


export { RWSCommand, COMMAND_DECORATOR_META_KEY }