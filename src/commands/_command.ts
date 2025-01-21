import 'reflect-metadata'; 
import { ConsoleService } from '../services/ConsoleService';
import { UtilsService } from '../services/UtilsService';
import { ConfigService } from '@nestjs/config';
import { ProcessService } from '../services/ProcessService';
import { DBService } from '../services/DBService';
import RWSModel from '../models/_model';
import * as path from 'path';
import { Injectable } from '@nestjs/common';
import { ParsedOptions } from '../../exec/src/application/cli.module';

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
  return (target: any, prop: string = null) => {
    const metadata: CmdMetadataType = { options: cmdOpts, _IS_CMD: true };
    Reflect.defineMetadata(COMMAND_DECORATOR_META_KEY, metadata, target);
  }
}

export { RWSCommand, COMMAND_DECORATOR_META_KEY }