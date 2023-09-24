import AWS from 'aws-sdk';
import AdmZip from 'adm-zip';
import fs from 'fs';
import path from 'path';
import { runShell, chmod, printFolderStructure, deleteDirectoryRecursive } from './tools.js';


const S3 = new AWS.S3();

const unzipAndMoveFiles = (zipFilePath, destFolder) => {
  const zip = new AdmZip(zipFilePath);
  zip.extractAllTo(destFolder, true);
  console.log('[EXTRACTION COMPLETE]');
};

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
      try {
        switch(params.command){
          case 'chmod': 
            await chmod(destFunctionDirPath);

            return { success: true, path: `${destFunctionDirPath}` };   
          case 'modules_exist':           
            return { success: fs.existsSync(destFunctionDirPath), path: `${destFunctionDirPath}` };       
          case 'remove_modules':
            deleteDirectoryRecursive(destFunctionDirPath);
            return { success: !fs.existsSync(destFunctionDirPath), path: `${destFunctionDirPath}` };
          case 'list_modules':          
            return { success: true, path: `${destFunctionDirPath}`, structure: printFolderStructure(destFunctionDirPath) };
        }
      } catch(e) {
        console.error(e.message)
        console.log(e)
        throw new Error(e);
      }      
    }else{
      return { success: false, error: 'Command unavailable' }
    }
  }

  console.log('[S3 Download Start]', `S3://${s3Bucket}/${modulesS3Key}`);

  return await new Promise(async (resolve, reject) => {
    try {
      const s3Stream = await S3.getObject({
        Bucket: s3Bucket,
        Key: modulesS3Key,
      }).promise();

      const zipPath = `${destDownloadsDirPath}/${modulesS3Key}`;
      fs.writeFileSync(zipPath, s3Stream.Body, 'binary');

      console.log('[S3 Download Finished]', zipPath);

      unzipAndMoveFiles(zipPath, destFunctionDirPath);
      await chmod(destFunctionDirPath);
      resolve({ success: true, path: destFunctionDirPath, structure: printFolderStructure(destFunctionDirPath) });

    } catch (error) {
      console.error('[Error]', error);
      reject({ success: false, errorCategory: 'GENERAL_ERROR', error });
    }
  });
};
