import { Injectable } from '@nestjs/common';
import { pushDbModels, setupPrisma } from '../install';

import {RWSBaseCommand, RWSCommand} from './_command';
import { ParsedOptions } from '../../exec/src/application/cli.module';


@Injectable()
@RWSCommand({name: 'db:push', description: 'DB push command.'})
export class DBPushCommand extends RWSBaseCommand {
  async run(
    passedParams: string[],
    options?: ParsedOptions
  ): Promise<void> {
    this.consoleService.log(this.consoleService.color().green('[RWS]') + ' starting systems...');

    try {
      const cfgData = this.configService;
      if (!cfgData) {
        this.consoleService.error('[RWS] No configuration found!');
        return;
      }

      try {
        if(!(options && Object.hasOwn(options, 'no-rws') && options['no-rws'].value)){
          await setupPrisma(false, {
            dbService: this.dbService.core(),
            processService: this.processService,
            configService: this.configService
          });
        }        
     
        await pushDbModels(false, {
          dbService: this.dbService.core(),
          processService: this.processService,
          configService: this.configService
        });
        this.consoleService.log(this.consoleService.color().green('[RWS]') + ' DB pushed.');
        process.exit();        
      } catch (error) {
        this.consoleService.error('Error while initiating RWS server installation:', error);
        throw error;
      }
    } catch (e: unknown) {
      this.consoleService.log(this.consoleService.color().red('[RWS]') + ' configuration error...');
      throw e;
    }
  }
}
