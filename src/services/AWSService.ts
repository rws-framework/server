import TheService from "./_service";

import AppConfigService from "./AppConfigService";
import ConsoleService from "./ConsoleService";
import LambdaService from "./LambdaService";

import path from 'path';
import fs from 'fs';
import AWS from 'aws-sdk';
import archiver from 'archiver';
import ZipService from "./ZipService";
import EFSService from "./EFSService";


const { log, warn, error, color, rwsLog } = ConsoleService;


class AWSService extends TheService {
    private region: string;

    private s3: AWS.S3;
    private efs: AWS.EFS;
    private lambda: AWS.Lambda;
    private ec2: AWS.EC2;
    private iam: AWS.IAM;
    private apiGateway: AWS.APIGateway;

    constructor() {
        super();        
    }

    _initApis(): void
    {

        if(!this.region){
            this.region = AppConfigService().get('aws_lambda_region');
        }

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
            for (let result of data.EvaluationResults) {
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

    getIAM(): AWS.IAM 
    {   
        this._initApis();

        return this.iam;
    }  
    
    getAPIGateway(): AWS.APIGateway 
    {   
        this._initApis();

        return this.apiGateway;
    }  
}

export default AWSService.getSingleton();