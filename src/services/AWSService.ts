import TheService from './_service';

import AppConfigService from './AppConfigService';
import ConsoleService from './ConsoleService';

import AWS from 'aws-sdk';


const { log, error } = ConsoleService;


class AWSService extends TheService {
    private region: string;

    private s3: AWS.S3;
    private efs: AWS.EFS;
    private lambda: AWS.Lambda;
    private ec2: AWS.EC2;
    private iam: AWS.IAM;
    private apiGateway: AWS.APIGateway;
    private cloudWatch: AWS.CloudWatchLogs;

    constructor() {
        super();        
    }

    _initApis(region?: string): void
    {        
        if(!region){
            this.region = AppConfigService().get('aws_lambda_region');
        }else{
            this.region = region;
        }

        // console.log(region,this.s3, this.region)

        if(!this.s3 && this.region){
            this.s3 = new AWS.S3({
                region: this.region,
                credentials: {
                    accessKeyId: AppConfigService().get('aws_access_key'),
                    secretAccessKey: AppConfigService().get('aws_secret_key'),
                }
            });
        }

        if (!this.apiGateway && this.region) {
            this.apiGateway = new AWS.APIGateway({
                region: this.region,
                credentials: {
                    accessKeyId: AppConfigService().get('aws_access_key'),
                    secretAccessKey: AppConfigService().get('aws_secret_key'),
                }
            });
        }

        if(!this.iam && this.region){
            this.iam = new AWS.IAM({
                region: this.region,
                credentials: {
                    accessKeyId: AppConfigService().get('aws_access_key'),
                    secretAccessKey: AppConfigService().get('aws_secret_key'),
                }
            });
        }

        if(!this.efs && this.region){
            this.efs = new AWS.EFS({
                region: this.region,
                credentials: {
                    accessKeyId: AppConfigService().get('aws_access_key'),
                    secretAccessKey: AppConfigService().get('aws_secret_key'),
                }
            });
        }

        if(!this.ec2 && this.region){
            this.ec2 = new AWS.EC2({
                region: AppConfigService().get('aws_lambda_region'),
                credentials: {
                    accessKeyId: AppConfigService().get('aws_access_key'),
                    secretAccessKey: AppConfigService().get('aws_secret_key'),
                }
            });
        }

        
        if(!this.lambda && this.region){
            this.lambda = new AWS.Lambda({
                region: this.region,
                credentials: {
                    accessKeyId: AppConfigService().get('aws_access_key'),
                    secretAccessKey: AppConfigService().get('aws_secret_key'),
                }
            });
        }

        if(!this.cloudWatch && this.region){
            this.cloudWatch = new AWS.CloudWatchLogs({
                region: this.region,
                credentials: {
                    accessKeyId: AppConfigService().get('aws_access_key'),
                    secretAccessKey: AppConfigService().get('aws_secret_key'),
                }
            });
        }
    }                 

    async checkForRolePermissions(roleARN: string, permissions: string[]): Promise<{ OK: boolean, policies: string[] }>
    {            
        const {OK, policies} = await this.firePermissionCheck(roleARN, permissions);

        return {
            OK,
            policies
        };
    }

    private async firePermissionCheck(roleARN: string, permissions: string[])
    {
        const params = {
            PolicySourceArn: roleARN, // Replace with your IAM role ARN
            ActionNames: permissions
        };

        const policies: string[] = [];
        let allowed = true;

        try {
            const data = await this.getIAM().simulatePrincipalPolicy(params).promise();
            for (const result of data.EvaluationResults) {
                if(result.EvalDecision !== 'allowed'){
                    allowed = false;
                    policies.push(result.EvalActionName);
                }
            }        
        } catch (err) {
            error('Permission check error:');
            log(err);
            allowed = false;
        }

        return {
            OK: allowed,
            policies: policies
        };
    }

    getS3(region?: string): AWS.S3 
    {        
        this._initApis(region);

        return this.s3;
    }

    getEC2(region?: string): AWS.EC2 
    {
        this._initApis(region);

        return this.ec2;
    }

    getEFS(region?: string): AWS.EFS 
    {   
        this._initApis(region);

        return this.efs;
    }

    getLambda(region?: string): AWS.Lambda
    {   
        this._initApis(region);

        return this.lambda;
    }

    getRegion(region?: string): string 
    {   
        this._initApis(region);

        return this.region;
    }

    getIAM(region?: string): AWS.IAM 
    {   
        this._initApis(region);

        return this.iam;
    }  
    
    getAPIGateway(region?: string): AWS.APIGateway 
    {   
        this._initApis(region);

        return this.apiGateway;
    }  

    getCloudWatch(region?: string): AWS.CloudWatchLogs
    {
        this._initApis(region);

        return this.cloudWatch;
    }
}

export default AWSService.getSingleton();