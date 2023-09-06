import TheService from "./_service";

import AppConfigService from "./AppConfigService";
import ConsoleService from "./ConsoleService";
import LambdaService from "./LambdaService";

import path from 'path';
import fs from 'fs';
import AWS from 'aws-sdk';
import archiver from 'archiver';
import { String } from "aws-sdk/clients/batch";


const { log, warn, error, color, AWSProgressBar } = ConsoleService;


class AWSService extends TheService {
    private region: string;

    private s3: AWS.S3;
    private efs: AWS.EFS;
    private lambda: AWS.Lambda;
    private ec2: AWS.EC2;

    constructor() {
        super();        
    }

    _initApis(): void
    {

        if(!this.region){
            this.region = AppConfigService().get('aws_lambda_region');
        }

        if(!this.s3){
            this.s3 = new AWS.S3({
                region: this.region,
                credentials: {
                    accessKeyId: AppConfigService().get('aws_access_key'),
                    secretAccessKey: AppConfigService().get('aws_secret_key'),
                }
            });
        }

        if(!this.efs){
            this.efs = new AWS.EFS({
                region: this.region,
                credentials: {
                    accessKeyId: AppConfigService().get('aws_access_key'),
                    secretAccessKey: AppConfigService().get('aws_secret_key'),
                }
            });
        }

        if(!this.ec2){
            this.ec2 = new AWS.EC2({
                region: this.region,
                credentials: {
                    accessKeyId: AppConfigService().get('aws_access_key'),
                    secretAccessKey: AppConfigService().get('aws_secret_key'),
                }
            });
        }

        
        if(!this.lambda){
            this.lambda = new AWS.Lambda({
                region: this.region,
                credentials: {
                    accessKeyId: AppConfigService().get('aws_access_key'),
                    secretAccessKey: AppConfigService().get('aws_secret_key'),
                }
            });
        }
    }

    async createArchive(outputPath: string, sourcePath: string, onlyNodeModules = false, fullzip = false): Promise<string> {
        const archive = archiver('zip');
        const output = fs.createWriteStream(outputPath);
        archive.pipe(output);

        if(fullzip){
            archive.glob('**', {
                cwd: sourcePath,
                dot: true                      
            });
        }else{

            if (onlyNodeModules) {
                archive.glob('**', {
                    cwd: `${process.cwd()}/node_modules`,
                    dot: true,
                    ignore: ['.rws/**'],                
                }, { prefix: 'node_modules' });
            } else {
                archive.glob('**', {
                    cwd: sourcePath,
                    dot: true,
                    ignore: ['node_modules/**']
                });
            }
        }

        archive.finalize();

        return new Promise((resolve, reject) => {
            output.on('close', () => resolve(outputPath));
            output.on('error', reject);
        });
    }

    async S3BucketExists(bucketName: string): Promise<string> { 
        try {
            log('WTF0', this.getRegion());
            await this.getS3().headBucket({ Bucket: bucketName }).promise();

            return bucketName;
        } catch (err: Error | any) {
            if (err.code === 'NotFound') {
                // Create bucket if it doesn't exist
                const params = {
                    Bucket: bucketName,
                };

                log('WTF', bucketName);

                await this.getS3().createBucket(params).promise();
                log(`${color().green(`[RWS Lambda Service]`)} s3 bucket ${bucketName} created.`);
                return bucketName;
            } else {
                // Handle other errors
                error(`Error checking bucket ${bucketName}:`, err);
            }
        }
    }

    async createEFS(functionName: string, subnetId: string): Promise<[string, boolean]> {      
        const response = await this.getEFS().describeFileSystems({ CreationToken: functionName }).promise();

        if (response.FileSystems && response.FileSystems.length > 0) {
            return [response.FileSystems[0].FileSystemId, true];
        } else {
            const params = {
                CreationToken: functionName,
                PerformanceMode: 'generalPurpose',
            };

            try {
                const response = await this.getEFS().createFileSystem(params).promise();
                await this.createMountTarget(response.FileSystemId, subnetId);
                console.log('EFS Created:', response);
                return [response.FileSystemId, false];
            } catch (error) {
                console.log('Error creating EFS:', error);
            }
        }
    }

    async createMountTarget(fileSystemId: string, subnetId: string) {
        const params = {
            FileSystemId: fileSystemId,
            SubnetId: subnetId,
        };

        try {
            const response = await this.getEFS().createMountTarget(params).promise();
            console.log('Mount Target Created:', response);
        } catch (error) {
            console.error('Error creating Mount Target:', error);
        }
    }

    async findDefaultVPC() {
        try {
            const response = await this.getEC2().describeVpcs({ Filters: [{ Name: 'isDefault', Values: ['true'] }] }).promise();

            if (response.Vpcs && response.Vpcs.length > 0) {
                console.log('Default VPC ID:', response.Vpcs[0].VpcId);
                return await this.getSubnetIdForVpc(response.Vpcs[0].VpcId);
            } else {
                console.log('No default VPC found.');
            }
        } catch (error) {
            console.error('Error fetching default VPC:', error);
        }
    }

    async getSubnetIdForVpc(vpcId: string): Promise<string> {
        const params = {
            Filters: [{
                Name: 'vpc-id',
                Values: [vpcId]
            }]
        };

        const result = await this.getEC2().describeSubnets(params).promise();

        if (result.Subnets && result.Subnets.length > 0) {
            return result.Subnets.map(subnet => subnet.SubnetId as string)[0];
        } else {
            return null;
        }
    }

    async listSecurityGroups(): Promise<string[]> 
    {


        try {
            const result = await this.getEC2().describeSecurityGroups().promise();

            const securityGroups = result.SecurityGroups || [];

            const securityGroupIds = securityGroups.map(sg => sg.GroupId);
            console.log('Security Group IDs:', securityGroupIds);

            return securityGroupIds;
        } catch (error) {
            console.error('Error fetching security groups:', error);
            return [];
        }
    }

    async uploadToEFS(efsId: string, modulesS3Key: string, s3Bucket:string, subnetId: string): Promise<any>
    {
        const efsLoaderFunctionName = await this.processEFSLoader(subnetId);

        const params = {
            FunctionName: efsLoaderFunctionName,
            InvocationType: 'RequestResponse', 
            Payload: JSON.stringify({
                efsId,
                modulesS3Key,
                s3Bucket
            }), 
        };
    
        try {
            const response = await this.getLambda().invoke(params).promise();
            return JSON.parse(response.Payload as string);
        } catch (error) {
            console.error('Error invoking Lambda:', error);
            throw error;
        }
    }

    async processEFSLoader(subnetId: string): Promise<string>
    {
        const executionDir = process.cwd();

        const filePath:string = module.id;        
        const cmdDir = filePath.replace('./', '').replace(/\/[^/]*\.ts$/, '');
        const moduleDir = path.resolve(cmdDir, '..', '..');
        const moduleCfgDir = `${executionDir}/node_modules/.rws`;

        const _UNZIP_FUNCTION_NAME: string = 'RWS_EFS_LOADER';

        if(!(await LambdaService.functionExists(_UNZIP_FUNCTION_NAME))){
            log(`${color().green(`[RWS Lambda Service]`)} creating EFS Loader as "${_UNZIP_FUNCTION_NAME}" lambda function.`);
            const lambdaPaths = await LambdaService.archiveLambda(`${moduleDir}/lambda-functions/efs_loader`, moduleCfgDir, true);

            await LambdaService.deployLambda(_UNZIP_FUNCTION_NAME, lambdaPaths, subnetId, true);
        }

        return _UNZIP_FUNCTION_NAME;
    }

    getS3(): AWS.S3 
    {
        this._initApis();

        return this.s3;
    }

    getEC2(): AWS.EC2 
    {
        this._initApis();

        return this.ec2;
    }

    getEFS(): AWS.EFS 
    {   
        this._initApis();

        return this.efs;
    }

    getLambda(): AWS.Lambda
    {   
        this._initApis();

        return this.lambda;
    }

    getRegion(): string 
    {   
        this._initApis();

        return this.region;
    }
}

export default AWSService.getSingleton();