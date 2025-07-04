import { Injectable } from '@nestjs/common';
import { migrateDbModels, setupPrisma } from '../install';

import {RWSBaseCommand, RWSCommand} from './_command';
import { ParsedOptions } from '../../exec/src/application/cli.module';


@Injectable()
@RWSCommand({name: 'db:migrate', description: 'DB migrate command.'})
export class DBMigrateCommand extends RWSBaseCommand {
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

      // if(!passedParams.length){
      //   throw new Error('You need a shadow DB name param passed.')
      // }
      

      try {      
        if(!(options && Object.hasOwn(options, 'no-rws') && options['no-rws'].value)){
          await setupPrisma(false, {
            dbService: this.dbService.core(),
            processService: this.processService,
            configService: this.configService
          });
        }
          
        await migrateDbModels(false, {
          dbService: this.dbService.core(),
          processService: this.processService,
          configService: this.configService
        });
        this.consoleService.log(this.consoleService.color().green('[RWS]') + ' DB migration complete.');
        process.exit();        
      } catch (error) {
        this.consoleService.error('Error while migrating RWS models to DB:', error);
        throw error;
      }
    } catch (e: unknown) {
      this.consoleService.log(this.consoleService.color().red('[RWS]') + ' configuration error...');
      throw e;
    }
  }
}
