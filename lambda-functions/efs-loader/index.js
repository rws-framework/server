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

async function unzipStuff(destPath, s3Stream)
{
    return new Promise((resolve, reject) => {
        const unzipStream = s3Stream.pipe(Extract({ path: destPath }));

        unzipStream.on('entry', (entry) => {
            console.log(`Extracting: ${entry.path}`);
          });
          
        unzipStream.on('error', (error) => {
            console.error('Error extracting zip:', error);
            reject(error);
        });        

        unzipStream.on('finish', () => resolve);
    });

}

export const handler = async (event, context) => {
  try {
    const { efsId, S3Bucket, modulesS3Key } = event;

    // 1. Stream zip from S3 bucket
    const downloadParams = {
      Bucket: S3Bucket,
      Key: modulesS3Key,
    };

    console.log('[S3 Download Start]', `S3://${S3Bucket}/${modulesS3Key}`);

    const s3Stream = S3.getObject(downloadParams).createReadStream();

    // 2. Unzip the zip to EFS ROOT/node_modules
    const destPath = '/mnt/efs/node_modules';

    if (fs.existsSync(destPath)) {
      console.log('[EFS Remove modules]');
      await runShell('rm -rf ' + destPath);
    }

    fs.mkdirSync(destPath, { recursive: true });
    await unzipStuff(destPath, s3Stream);

    console.log('[EFS Unzip Complete]', fs.readdirSync(destPath));

    return 'Upload completed.';
  } catch (error) {
    throw new Error(error);
  }
};
