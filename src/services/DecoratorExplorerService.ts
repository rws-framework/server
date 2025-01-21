import 'reflect-metadata';
import { DiscoveryService } from '@nestjs/core';
import { Injectable } from '@nestjs/common';
import { COMMAND_DECORATOR_META_KEY, CmdMetadataType, RWSBaseCommand } from '../commands/_command';
import path from 'path';
import fs from 'fs';
import { MD5Service } from './MD5Service';
import { UtilsService } from './UtilsService';

export type CMDProvider = {
  instance: RWSBaseCommand,
  metadata: CmdMetadataType
}

export type CMDProviderList = {
  [key: string]: CMDProvider
}

@Injectable()
export class DecoratorExplorerService {
  constructor(private readonly discoveryService: DiscoveryService, private readonly utilsService: UtilsService, private readonly md5Service: MD5Service) {}

  getCommandProviders(): CMDProviderList
  {    
    const providers = this.discoveryService.getProviders(); 
    const metadDataBag: CMDProviderList = {};
    
    
    for(const wrapper of providers){
      if (wrapper.instance) {
        const constructor = wrapper.instance.constructor;
        const metadata: CmdMetadataType = Reflect.getMetadata(COMMAND_DECORATOR_META_KEY, constructor);      
                 
        if (metadata) {
          metadDataBag[metadata.options.name] = {
            instance: wrapper.instance,
            metadata
          };
        }
      }
    };

    return metadDataBag;
  }


}