import TheService from "./_service";

import AppConfigService from "./AppConfigService";
import ConsoleService from "./ConsoleService";
import AWSService from "./AWSService";
import ZipService from "./ZipService";
import S3Service from "./S3Service";

import path from 'path';
import fs from 'fs';
import AWS from 'aws-sdk';
import archiver from 'archiver';
import { String } from "aws-sdk/clients/batch";
import { getAppConfig, ProcessService } from "rws-js-server";
import EFSService from "./EFSService";


const { log, warn, error, color, AWSProgressBar } = ConsoleService;


class TraversalService extends TheService {
  getAllFilesInFolder(folderPath: string, ignoreFilenames: string[] = [], recursive: boolean = false): string[] 
  {
    const files: string[] = [];
  
    function traverseDirectory(currentPath: string): void 
    {
      const entries = fs.readdirSync(currentPath, { withFileTypes: true });
  
      entries.forEach(entry => {
        const entryPath = path.join(currentPath, entry.name);
  
        if (entry.isFile()) {
          if(!ignoreFilenames.includes(entryPath)){
            files.push(entryPath);
          }            
        } else if (entry.isDirectory() && recursive) {
          traverseDirectory(entryPath);
        }
      });
    }
  
    traverseDirectory(folderPath);

    return files;
  }
}

export default TraversalService.getSingleton();