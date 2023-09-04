import TheService from "./_service";

import AppConfigService from "./AppConfigService";
import ConsoleService from "./ConsoleService";

import path from 'path';
import fs from 'fs';
import AWS from 'aws-sdk';
import archiver from 'archiver';
import { String } from "aws-sdk/clients/batch";


const { log, warn, error, color, AWSProgressBar } = ConsoleService;


class LambdaService extends TheService
{

  private region: string;
  private lambda: AWS.Lambda;
  private s3: AWS.S3;
  private efs = AWS.EFS as any;

    constructor()
    {
      super();     
    }

    async archiveLambda(lambdaDirPath: string, moduleCfgDir: string): Promise<[string, string]> {
      log(color().green('[RWS Lambda Service]') + ' initiating archiving of: ', lambdaDirPath);
      const lambdaDirName = lambdaDirPath.split('/').filter(Boolean).pop();    
      const [zipPathWithNodeModules, zipPathWithoutNodeModules] = this.determineLambdaPackagePaths(lambdaDirName, moduleCfgDir);
  
      // Create lambda directory if it doesn't exist
      if (!fs.existsSync(path.join(moduleCfgDir, 'lambda'))) {
          fs.mkdirSync(path.join(moduleCfgDir, 'lambda'));
      }
  
      // Create archives
      const tasks: Promise<string>[] = [];
      if (!fs.existsSync(zipPathWithNodeModules)) {
          tasks.push(this.createArchive(zipPathWithNodeModules, lambdaDirPath));
      }
      if (!fs.existsSync(zipPathWithoutNodeModules)) {
          tasks.push(this.createArchive(zipPathWithoutNodeModules, lambdaDirPath, true));
      }
      
      await Promise.all(tasks);
  
      log(`${color().green('[RWS Lambda Service]')} ${color().yellowBright('ZIP package complete.')}`);

      return [zipPathWithNodeModules, zipPathWithoutNodeModules];
    }

    determineLambdaPackagePaths(lambdaDirName: string, moduleCfgDir: string): [string, string] {
      const zipPathWithNodeModules = path.join(moduleCfgDir, 'lambda', `lambda-${lambdaDirName}-modules.zip`);
      const zipPathWithoutNodeModules = path.join(moduleCfgDir, 'lambda', `lambda-${lambdaDirName}-app.zip`);
      return [zipPathWithoutNodeModules, zipPathWithNodeModules];
    }

    async createArchive(outputPath: string, sourcePath: string, onlyNodeModules = false): Promise<string> 
    {
      const archive = archiver('zip');
      const output = fs.createWriteStream(outputPath);
      archive.pipe(output);
  
      if (onlyNodeModules) {
          archive.directory(`${sourcePath}/node_modules`, 'node_modules');
      } else {
          archive.glob('**', {
              cwd: sourcePath,
              dot: true,
              ignore: ['node_modules/**']
          });
      }
  
      archive.finalize();
  
      return new Promise((resolve, reject) => {
          output.on('close', () => resolve(outputPath));
          output.on('error', reject);
      });
    }

    async createLambdaLayer(zipPath: string, functionName: string): Promise<string>
    {
      const s3BucketName = AppConfigService().get('aws_lambda_bucket');      

      const zipFile = fs.readFileSync(zipPath);

      log(`${color().green('[RWS Lambda Service]')} ${color().yellowBright('deploying lambda layer on ' + this.region + ' using ' + functionName)}`);

      const s3params = {
        Bucket: s3BucketName,
        Key: functionName + '-modules.zip',
        Body: zipFile
      };
   
      const uplPromise = this.s3.upload(s3params);      

      try {
        log(`${color().green('[RWS Lambda Service]')} layer uploading ${zipPath} to S3Bucket`);

        const s3Data = await uplPromise.promise();
        const s3Path = s3Data.Key;            

        log(`${color().green('[RWS Lambda Service]')} ${color().yellowBright('lambda layer is uploaded to ' + this.region + ' with key:  ' + s3Path)}`);        

        const Code = {
          S3Bucket: s3BucketName,
          S3Key: s3Path
        }

        const params = {
            Content: {
                ...Code 
            },
            LayerName: functionName + '-layer',
            CompatibleRuntimes: ["nodejs18.x"],
            Description: "RWS Lambda Node Modules Layer"
        };
    
        try {
            const response = await this.lambda.publishLayerVersion(params).promise();

            log(`${color().green('[RWS Lambda Service]')} ${color().yellowBright('lambda layer is configured in' + this.region + ' with ARN:  ' + response.LayerVersionArn)}`);

            return response.LayerVersionArn;
        } catch (error:  Error | any) {
            console.error("Error creating layer:", error);
        }
      } catch (e: Error | any) {
        throw e;
      }
  };

    async deployLambda(functionName: string, appPaths: string[], subnetId?: string): Promise<any>
    {                
      const [zipPath, layerPath] = appPaths;

      console.log(appPaths);

      this.region = AppConfigService().get('aws_lambda_region');
      this.lambda = new AWS.Lambda({
        region: this.region,
        credentials: {
          accessKeyId: AppConfigService().get('aws_access_key'),
          secretAccessKey: AppConfigService().get('aws_secret_key'),    
        }
      });

      const zipFile = fs.readFileSync(zipPath);

      try {
         
          const s3BucketName = AppConfigService().get('aws_lambda_bucket');
          
          await this.S3BucketExists(s3BucketName);

          // const layerARN = await this.createLambdaLayer(layerPath, functionName);
          const efsId = await this.createEFS(functionName, subnetId);          

          log(`${color().green('[RWS Lambda Service]')} ${color().yellowBright('deploying lambda on ' + this.region + ' using ' + s3BucketName)}`);
          const s3params = {
            Bucket: s3BucketName,
            Key: functionName + '.zip', // File name you want to save as in S3
            Body: zipFile
          };

          try {        
            const uplPromise = this.s3.upload(s3params);

            // AWSProgressBar(uplPromise);

            const s3Data = await uplPromise.promise();

            log(`${color().green('[RWS Lambda Service]')} uploading ${zipPath} to S3Bucket`);

            const s3Path = s3Data.Key;            
            const Code = {
              S3Bucket: s3BucketName,
              S3Key: s3Path
            }
  
            let data = null;

            if(await this.functionExists(functionName)){
              data = await this.lambda.updateFunctionCode({
                FunctionName: functionName,
                ...Code
              }).promise();
            } else{
              const createParams: AWS.Lambda.Types.CreateFunctionRequest = {
                FunctionName: functionName,
                Runtime: 'nodejs18.x',  
                Role: AppConfigService().get('aws_lambda_role'),  
                Handler: 'index.js', 
                Code,
                VpcConfig: {
                  SubnetIds: [subnetId],  // Add your subnet IDs
                  SecurityGroupIds: await this.listSecurityGroups(),  // Add your security group ID
                }
              };

              console.log(createParams);

              data = await this.lambda.createFunction(createParams).promise()
            }            

            // try{
            //   await this.waitForLambda(functionName);
            //   await this.lambda.updateFunctionConfiguration({
            //     FunctionName: functionName,
            //     Layers: [layerARN]
            //   }).promise();

            //   log(`${color().green(`[RWS Lambda Service] lambda layer for "${functionName}" is configured`)}`);  
            // } catch(e: Error | any) {
            //   throw e;
            // }
            
            fs.unlinkSync(zipPath);          
            fs.unlinkSync(layerPath);         
            log(`${color().green('[RWS Lambda Service]')} ${color().yellowBright(`${zipPath} has been deleted after successful deployment`)}`);

            log(`${color().green(`[RWS Lambda Service] lambda function "${functionName}" deployed`)}`);    

          } catch (e: Error | any){
            throw e;
          }       

      } catch (err: Error | any) {
          error(err.message);
          log(err.stack)
      }
    }

    private async functionExists(functionName: String): Promise<boolean>
    {      
      try {
        await this.lambda.getFunction({ FunctionName: functionName }).promise();
      } catch (e: Error | any) {
        if (e.code === 'ResourceNotFoundException') {
          return false;         
        }
      }

      return true;
    }

    async S3BucketExists(bucketName: string): Promise<string> {
      this.s3 = new AWS.S3({
        region: this.region,
        credentials: {
          accessKeyId: AppConfigService().get('aws_access_key'),
          secretAccessKey: AppConfigService().get('aws_secret_key'),    
        }
      });  
    
      try { 
        log('WTF0', this.region);       
        await this.s3.headBucket({ Bucket: bucketName }).promise();     
        return bucketName;      
      } catch (err: Error | any) {
        if (err.code === 'NotFound') {
          // Create bucket if it doesn't exist
          const params = {
            Bucket: bucketName,       
          };

          log('WTF', bucketName);
          
          await this.s3.createBucket(params).promise();
          log(`${color().green(`[RWS Lambda Service]`)} s3 bucket ${bucketName} created.`);
          return bucketName;
        } else {
          // Handle other errors
          error(`Error checking bucket ${bucketName}:`, err);
        }
      }
    }

    async waitForLambda(functionName: string, timeoutMs: number = 300000, intervalMs: number = 5000): Promise<void> {
      const startTime = Date.now();
  
      while (Date.now() - startTime < timeoutMs) {
          const { Configuration } = await this.lambda.getFunction({ FunctionName: functionName }).promise();
          
          if (Configuration.State === 'Active') {
              return; // Lambda is active and ready
          }
          
          // If the state is 'Failed', you can either throw an error or handle it differently based on your use case
          if (Configuration.State === 'Failed') {
              throw new Error(`Lambda function ${functionName} failed to be ready. Reason: ${Configuration.StateReason}`);
          }
  
          // Wait for the specified interval
          await new Promise(resolve => setTimeout(resolve, intervalMs));
      }
  
      throw new Error(`Lambda function ${functionName} did not become ready within ${timeoutMs}ms.`);
  }

  async createEFS(functionName: string, subnetId: string): Promise<string> 
  {
    this.efs = new AWS.EFS({
      region: this.region,
      credentials: {
        accessKeyId: AppConfigService().get('aws_access_key'),
        secretAccessKey: AppConfigService().get('aws_secret_key'),    
      }
    });


    const response = await this.efs.describeFileSystems({ CreationToken: functionName }).promise();

    if (response.FileSystems && response.FileSystems.length > 0) {
        return response.FileSystemId;
    } else {
      const params = {
          CreationToken: functionName,
          PerformanceMode: 'generalPurpose',
      };

      try {
          const response = await this.efs.createFileSystem(params).promise();
          await this.createMountTarget(response.FileSystemId, subnetId);
          console.log('EFS Created:', response);
          return response.FileSystemId;
      } catch (error) {
          console.log('Error creating EFS:', error);
      }
    }
  }

  async createMountTarget(fileSystemId: string, subnetId: string) 
  {
    const params = {
        FileSystemId: fileSystemId,
        SubnetId: subnetId,        
    };

    try {
        const response = await this.efs.createMountTarget(params).promise();
        console.log('Mount Target Created:', response);
    } catch (error) {
        console.error('Error creating Mount Target:', error);
    }
  }

  async findDefaultVPC() {
    const ec2 = new AWS.EC2({
      region: AppConfigService().get('aws_lambda_region'),
      credentials: {
        accessKeyId: AppConfigService().get('aws_access_key'),
        secretAccessKey: AppConfigService().get('aws_secret_key'),    
      }
    });

    try {
        const response = await ec2.describeVpcs({ Filters: [{ Name: 'isDefault', Values: ['true'] }] }).promise();

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
    
    const ec2 = new AWS.EC2({
      region: AppConfigService().get('aws_lambda_region'),
      credentials: {
        accessKeyId: AppConfigService().get('aws_access_key'),
        secretAccessKey: AppConfigService().get('aws_secret_key') 
      }
    });

    const params = {
        Filters: [{
            Name: 'vpc-id',
            Values: [vpcId]
        }]
    };

    const result = await ec2.describeSubnets(params).promise();

    if (result.Subnets && result.Subnets.length > 0) {
        return result.Subnets.map(subnet => subnet.SubnetId as string)[0];
    } else {
        return null;
    }
  } 

  async listSecurityGroups(): Promise<string[]> 
  {
    const ec2 = new AWS.EC2({
      region: this.region,
      credentials: {
        accessKeyId: AppConfigService().get('aws_access_key'),
        secretAccessKey: AppConfigService().get('aws_secret_key'),    
      }
    });

    try {
        const result = await ec2.describeSecurityGroups().promise();

        const securityGroups = result.SecurityGroups || [];

        const securityGroupIds = securityGroups.map(sg => sg.GroupId);
        console.log('Security Group IDs:', securityGroupIds);

        return securityGroupIds;
    } catch (error) {
        console.error('Error fetching security groups:', error);
        return [];
    }
  }
}

export default LambdaService.getSingleton();