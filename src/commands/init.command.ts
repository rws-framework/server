import { Command, CommandRunner } from 'nest-cli';
import { Injectable } from '@nestjs/common';
import { setupRWS, setupPrisma } from '../install';
import { ConsoleService } from '../services/ConsoleService';
import { UtilsService } from '../services/UtilsService';
import { ConfigService } from '@nestjs/config';
import * as path from 'path';
import IAppConfig from '../types/IAppConfig';

@Injectable()
@Command({
  name: 'init',
  description: 'Command that builds RWS config files along with Prisma client.\nThis CMD creates schema files for Prisma from RWS model files passed to configuration.\nUsed in postinstall scripts.'
})
export class InitCommand extends CommandRunner {
  private packageRootDir: string;
  private moduleDir: string;
  private executionDir: string;

  constructor(
    private readonly utilsService: UtilsService,
    private readonly consoleService: ConsoleService,
    private readonly configService: ConfigService
  ) {
    super();
    this.executionDir = process.cwd();
    this.packageRootDir = this.utilsService.findRootWorkspacePath(this.executionDir);
    this.moduleDir = path.resolve(path.dirname(module.id), '..', '..');
  }

  async run(passedParams: string[]): Promise<void> {
    this.consoleService.log(this.consoleService.color().green('[RWS]') + ' starting systems...');

    try {
      // Get config from the ConfigService, which was set up with the passed config
      const cfgData = this.configService;
      
      if (!cfgData) {
        this.consoleService.error('[RWS] No configuration found!');
        return;
      }

      try {
        await setupRWS(cfgData);
        await setupPrisma(cfgData);
        this.consoleService.log(this.consoleService.color().green('[RWS]') + ' systems initialized.');
      } catch (error) {
        this.consoleService.error('Error while initiating RWS server installation:', error);
        throw error;
      }
    } catch (e: Error | any) {
      this.consoleService.log(this.consoleService.color().red('[RWS]') + ' configuration error...');
      throw e;
    }
  }
}