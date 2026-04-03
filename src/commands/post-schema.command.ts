import { Injectable } from '@nestjs/common';
import { postSchemaGenerate } from '../install';

import {RWSBaseCommand, RWSCommand} from './_command';
import { ParsedOptions } from '../../exec/src/application/cli.module';


@Injectable()
@RWSCommand({name: 'db:post-generate', description: 'Post schema generation command.'})
export class PostSchemaCommand extends RWSBaseCommand {
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
        await postSchemaGenerate(cfgData);
        process.exit();        
      } catch (error) {
        this.consoleService.error('Error while executing post schema generation:', error);
        throw error;
      }
    } catch (e: unknown) {
      this.consoleService.log(this.consoleService.color().red('[RWS]') + ' configuration error...');
      throw e;
    }
  }
}
