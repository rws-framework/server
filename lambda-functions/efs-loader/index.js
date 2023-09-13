import AWS from 'aws-sdk';
import { createReadStream } from 'fs';
import { Extract } from 'unzipper';
import fs from 'fs';
import { exec } from 'child_process';
import { resolve } from 'path';

const S3 = new AWS.S3();


async function runShell(cmd)
{
    return new Promise((resolve, reject) => {
        exec(cmd, (error, stdout, stderr) => {
            if (stdout) {
            console.log('Shell Output:', stdout);
            }
            if (stderr) {
                console.error('Shell Error Output:', stderr);                
            }

            if (error) {
                callback(error);
                reject(error);
            } else if (stderr) {
                callback(new Error(stderr));
                reject(error);
            } else {
                callback(null, stdout);
                resolve(stdout);
            }
        });
    });
}


export const handler = async (event, context) => {
    try {        
        const { efsId, S3Bucket, modulesS3Key } = event;

        // 1. Stream zip from S3 bucket
        const downloadParams = {
            Bucket: S3Bucket,
            Key: modulesS3Key
        };        

        console.log('[S3 Download Start]', `S3://${S3Bucket}/${modulesS3Key}`);

        const s3Stream = S3.getObject(downloadParams).createReadStream();

        console.log('[S3 Download Complete]', s3Stream);


        //2. Unzip the zip to efs ROOT/node_modules
        const destPath = '/mnt/efs/node_modules';

        if(fs.existsSync(destPath)){            
            console.log('[EFS Remove modules]');
            console.log(runShell('rm -rf ' + destPath));
        }else{
            fs.mkdirSync(destPath, { recursive: true });
        }
        
        await s3Stream.pipe(Extract({ path: destPath }));

        console.log('[EFS Unzip Complete]', fs.readdirSync(destPath));
        
        return 'Unload completed.';
    } catch (error) {
        throw new Error(error);
    }
};
