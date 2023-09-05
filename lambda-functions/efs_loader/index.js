import { S3 } from 'aws-sdk';
import fs from 'fs';
import unzipper from 'unzipper';

const runModuleExec = (name) => {
  const binPath = '/mnt/efs/node_modules/.bin';
  return `${binPath}/${name}`;
}

const req = (name) => {
    const modPath = '/mnt/efs/node_modules';
    return require(`${modPath}/${name}`);
}

export const handler = async (event, context, callback) => {
  try {
      // 0. Get params from lambda invocation
      const { efsId, S3Bucket, modulesS3Key } = event;

      // 1. Download zip from S3 bucket
      const downloadParams = {
          Bucket: S3Bucket,
          Key: modulesS3Key
      };
      const zipFile = await s3.getObject(downloadParams).promise();

      // 2. Unzip the zip to efs ROOT/node_modules
      const destPath = '/mnt/efs/node_modules';
      await fs.createReadStream(zipFile.Body)
          .pipe(unzipper.Extract({ path: destPath }))
          .promise();

      callback('Unload completed.');
  } catch (error) {
      callback(error);
  }
};