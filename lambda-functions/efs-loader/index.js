import AWS from 'aws-sdk';
import {Extract} from 'unzipper';
import fs from 'fs';
import { exec } from 'child_process';
import path from 'path';
import { runShell, chmod, printFolderStructure } from './tools.js';


const S3 = new AWS.S3();


export const handler = async (event, context) => {
  console.log('EVENT_PAYLOAD ||| ', event);

  const { functionName, efsId, modulesS3Key, s3Bucket, params } = event;

  const resPath = '/mnt/efs/res';

  const allowedCommands = [
    'chmod',
    'modules_exist',
    'remove_modules',
    'list_modules'
  ];

  if (!fs.existsSync(resPath)) {
    fs.mkdirSync(resPath, { recursive: true });
  }

  const modulesPath = `${resPath}/modules`;
  const downloadsPath = `${resPath}/downloads`;
  const destFunctionDirPath = `${modulesPath}/${functionName}`;
  const destDownloadsDirPath = `${downloadsPath}/${functionName}`;

  if (!fs.existsSync(modulesPath)) {
    fs.mkdirSync(modulesPath, { recursive: true });
  }

  if (!fs.existsSync(destFunctionDirPath)) {
    fs.mkdirSync(destFunctionDirPath, { recursive: true });
  }

  if (!fs.existsSync(downloadsPath)) {
    fs.mkdirSync(downloadsPath, { recursive: true });
  }

  if (!fs.existsSync(destDownloadsDirPath)) {
    fs.mkdirSync(destDownloadsDirPath, { recursive: true });
  }

  if(params && !!params.command){
    if(allowedCommands.includes(params.command)){
      switch(params.command){
        case 'chmod': 
          await chmod(destFunctionDirPath);

          return { success: true, path: `${destFunctionDirPath}` };   
        case 'modules_exist':           
          return { success: fs.existsSync(destFunctionDirPath), path: `${destFunctionDirPath}` };       
        case 'remove_modules':
          await runShell(`rm -rf ${destFunctionDirPath}`);
          return { success: true, path: `${destFunctionDirPath}` };
        case 'list_modules':          
          return { success: true, path: `${destFunctionDirPath}`, structure: printFolderStructure(destFunctionDirPath) };

      }      
    }else{
      return { success: false, error: 'Command unavailable' }
    }
  }

  console.log('[S3 Download Start]', `S3://${s3Bucket}/${modulesS3Key}`);

  return new Promise(async (resolve, reject) => {
    try {
      const s3Stream = await S3.getObject({
        Bucket: s3Bucket,
        Key: modulesS3Key,
      }).promise();

      fs.writeFileSync(`${destDownloadsDirPath}/${modulesS3Key}`, s3Stream.Body, 'binary')
  
      console.log('[S3 Download Finished]', `${destDownloadsDirPath}/${modulesS3Key}`);

      const readStream = fs.createReadStream(`${destDownloadsDirPath}/${modulesS3Key}`);

      // Pipe the S3 stream directly into the unzipper
      readStream.pipe(Extract({ path: destFunctionDirPath }))
        .on('finish', () => {          
          chmod(destFunctionDirPath);
          
          console.log('[Extraction complete]');          
          resolve({ success: true, path: destFunctionDirPath, structure: printFolderStructure(destFunctionDirPath) })
        })
        .on('error', (archiveErr) => {
          console.error('[Extraction error]:', archiveErr);
          reject({ success: false, errorCategory: 'UNZIP_ERROR', error: archiveErr })
        });    
    
    } catch (s3FileErr) {
      console.error('[S3 Read Error]', s3FileErr);
      reject({ success: false, errorCategory: 'S3_READ_ERROR', error: s3FileErr });
    }
  });  
};
