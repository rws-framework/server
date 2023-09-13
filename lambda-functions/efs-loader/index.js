import AWS from 'aws-sdk';
import fs from 'fs';
import { Extract } from 'unzipper';
import { exec } from 'child_process';

const S3 = new AWS.S3();

async function runShell(cmd) {
  return new Promise((resolve, reject) => {
    exec(cmd, (error, stdout, stderr) => {
      if (stdout) {
        console.log('Shell Output:', stdout);
      }
      if (stderr) {
        console.error('Shell Error Output:', stderr);
      }

      if (error) {
        reject(error);
      } else if (stderr) {
        reject(new Error(stderr));
      } else {
        resolve(stdout);
      }
    });
  });
}

/**
 *  functionName: `RWS-${baseFunctionName}`,
                efsId,
                modulesS3Key,
                s3Bucket
 * @param {*} event 
 * @param {*} context 
 * @returns 
 */

export const handler = async (event, context) => {
    console.log('EVENT_PAYLOAD ||| ', event)

    const { functionName, efsId, modulesS3Key, s3Bucket } = event;

    const resPath = '/mnt/efs/res';

    if (!fs.existsSync(resPath)) {
      fs.mkdirSync(resPath, { recursive: true });
    }

    const destPath = `${resPath}/node_modules`;
    const destFunctionPath = `${destPath}/${functionName}`;

    if (!fs.existsSync(destPath)) {
      fs.mkdirSync(destPath, { recursive: true });
    }

    if (!fs.existsSync(destFunctionPath)) {
      fs.mkdirSync(destFunctionPath, { recursive: true });
    }

    console.log('[S3 Download Start]', `S3://${s3Bucket}/${modulesS3Key}`);

    try{
      const s3File = await S3.getObject({
        Bucket: s3Bucket,
        Key: modulesS3Key
      }).promise();

      const destFilePath = `${destFunctionPath}/package.json`;

      console.log('[S3 Download Complete]', destFilePath);

      try {
      await fs.writeFile(destFilePath, s3File.Body);

      const res = await runShell(`cd ${destFunctionPath} && npm install`);
      
      console.log('RESULT', res);

      return { success: true, path: destFilePath };
      } catch(FSFileErr){
        onsole.error('[FS write error]', FSFileErr)
      }
    } catch(s3FileErr){
      console.error('[FS read error]', s3FileErr)
    }    
};
