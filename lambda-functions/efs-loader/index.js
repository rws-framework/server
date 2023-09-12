const AWS = require('aws-sdk');
const fs = require('fs');
const unzipper = require('unzipper');

const S3 = new AWS.S3();

exports.handler = async (event, context, callback = null) => {
        try {
            // 0. Get params from lambda invocation
            const { efsId, S3Bucket, modulesS3Key } = event;

            // 1. Download zip from S3 bucket
            const downloadParams = {
                Bucket: S3Bucket,
                Key: modulesS3Key
            };
            
            const zipFile = await S3.getObject(downloadParams).promise();

            // 2. Unzip the zip to efs ROOT/node_modules
            const destPath = '/mnt/efs/node_modules';
            await fs.createReadStream(zipFile.Body)
                .pipe(unzipper.Extract({ path: destPath }))
                .promise();

            if(callback){
                callback(null, 'Unload completed.');
            }
        } catch (error) {
            if(callback){
                callback(error);
            }
        }
};
