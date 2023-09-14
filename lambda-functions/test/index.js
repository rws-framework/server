import AWS from 'aws-sdk';

const s3 = new AWS.S3();

export const handler = async (event) => {
    const { functionName, efsId, modulesS3Key, s3Bucket } = event;

    const params = {
        Bucket: s3Bucket,
        Key: modulesS3Key
    };

    return new Promise((resolve, reject) => {
        console.log(`Start downloading: `, params);
        s3.getObject(params, (err, data) => {
            if (err) {
                console.error('Error fetching from S3:', err);
                reject({
                    statusCode: 500,
                    body: 'Failed to download file from S3'
                });
            } else {
                // Print information about the downloaded file
                console.log('Content Type:', data.ContentType);
                console.log('Content Length:', data.ContentLength);
                console.log('Last Modified:', data.LastModified);

                console.log(`Saving file to: /mnt/efs/test/${modulesS3Key}`);

                fs.writeFileSync(`/mnt/efs/test/${modulesS3Key}`, data.Body);

                resolve({
                    statusCode: 200,
                    body: `File downloaded successfully to /mnt/efs/test/${modulesS3Key}`
                });
            }
        });
    });
};
