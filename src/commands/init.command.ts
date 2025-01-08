import { Command, CommandRunner } from 'nest-commander'; // Tu jest zmiana - nest-commander zamiast @nestjs/cli
import { Injectable } from '@nestjs/common';
import { setupRWS, setupPrisma } from '../install';
import { ConsoleService } from '../services/ConsoleService';
import { UtilsService } from '../services/UtilsService';
import { ConfigService } from '@nestjs/config';
import * as path from 'path';
import {RWSTSLocator} from '../../nest/decorators/RWSTSLocator';
import 'reflect-metadata';
import { ProcessService } from '../services/ProcessService';
import { DBService } from '../services/DBService';

@RWSTSLocator()
@Injectable()
export class InitCommand  {
  private packageRootDir: string;
  private executionDir: string;

  constructor(
    private readonly utilsService: UtilsService,
    private readonly consoleService: ConsoleService,
    private readonly configService: ConfigService,
    private readonly processService: ProcessService,
    private readonly dbService: DBService,
  ) {    
    this.executionDir = process.cwd();
    this.packageRootDir = this.utilsService.findRootWorkspacePath(__dirname);
  }

  async run(
    passedParams: string[], // parametry przekazane z CLI
    options?: Record<string, any>, // opcje z flag
  ): Promise<void> {
    this.consoleService.log(this.consoleService.color().green('[RWS]') + ' starting systems...');

    try {
      const cfgData = this.configService;
      if (!cfgData) {
        this.consoleService.error('[RWS] No configuration found!');
        return;
      }

      try {
        await setupRWS();
        await setupPrisma(false, {
          dbService: this.dbService,
          processService: this.processService,
          configService: this.configService
        });
        this.consoleService.log(this.consoleService.color().green('[RWS]') + ' systems initialized.');
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
