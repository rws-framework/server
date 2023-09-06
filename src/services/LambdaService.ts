import TheService from "./_service";

import AppConfigService from "./AppConfigService";
import ConsoleService from "./ConsoleService";
import AWSService from "./AWSService";

import path from 'path';
import fs from 'fs';
import AWS from 'aws-sdk';
import archiver from 'archiver';
import { String } from "aws-sdk/clients/batch";
import { getAppConfig, ProcessService } from "rws-js-server";


const { log, warn, error, color, AWSProgressBar } = ConsoleService;


class LambdaService extends TheService {

  private region: string;
  private lambda: AWS.Lambda;
  private s3: AWS.S3;
  private efs = AWS.EFS as any;

  constructor() {
    super();
  }

  async archiveLambda(lambdaDirPath: string, moduleCfgDir: string, fullArchive: boolean = false): Promise<[string, string]> {
    log(color().green('[RWS Lambda Service]') + ' initiating archiving of: ', lambdaDirPath);
    const lambdaDirName = lambdaDirPath.split('/').filter(Boolean).pop();
    const [zipPathWithoutNodeModules, zipPathWithNodeModules] = this.determineLambdaPackagePaths(lambdaDirName, moduleCfgDir);

    
    if (!fs.existsSync(path.join(moduleCfgDir, 'lambda'))) {
      fs.mkdirSync(path.join(moduleCfgDir, 'lambda'));
    }

    // Create archives
    const tasks: Promise<string>[] = [];

    if(fullArchive){
      tasks.push(AWSService.createArchive(zipPathWithNodeModules, lambdaDirPath, false, true));
    } else {
      if (!fs.existsSync(zipPathWithNodeModules)) {
        log(`${color().green('[RWS Lambda Service]')} archiving .node_modules from ROOT_DIR to .zip`);
        tasks.push(AWSService.createArchive(zipPathWithNodeModules, lambdaDirPath, true));
      }
      
      if (fs.existsSync(zipPathWithoutNodeModules)) {
        fs.unlinkSync(zipPathWithoutNodeModules);
      }
  
      log(`${color().green('[RWS Lambda Service]')} archiving ${lambdaDirPath} to .zip`);
      tasks.push(AWSService.createArchive(zipPathWithoutNodeModules, lambdaDirPath));
      
  
      await Promise.all(tasks);
    }     

    log(`${color().green('[RWS Lambda Service]')} ${color().yellowBright('ZIP package complete.')}`);

    return [zipPathWithNodeModules, zipPathWithoutNodeModules];
  }

  determineLambdaPackagePaths(lambdaDirName: string, moduleCfgDir: string): [string, string] {
    const zipPathWithNodeModules = path.join(moduleCfgDir, 'lambda', `RWS-modules.zip`);
    const zipPathWithoutNodeModules = path.join(moduleCfgDir, 'lambda', `lambda-${lambdaDirName}-app.zip`);
    return [zipPathWithoutNodeModules, zipPathWithNodeModules];
  }

  async deployLambda(functionName: string, appPaths: string[], subnetId?: string, noEFS: boolean = false): Promise<any> {
    const [zipPath, layerPath] = appPaths;

    console.log(appPaths);

    this.region = AppConfigService().get('aws_lambda_region');

    const zipFile = fs.readFileSync(zipPath);

    try {

      const s3BucketName = AppConfigService().get('aws_lambda_bucket');

      await AWSService.S3BucketExists(s3BucketName);

      // const layerARN = await this.createLambdaLayer(layerPath, functionName);
      const [efsId, efsExisted] = await AWSService.createEFS('RWS_EFS', subnetId);

      if(!noEFS){
        if(!efsExisted){
          log(`${color().green('[RWS Lambda Service]')} creating EFS for lambda.`);
  
          await this.deployModules(layerPath, functionName, efsId, subnetId);
        }else{
          log(`${color().green('[RWS Lambda Service]')} EFS for lambda is created.`);
          await this.deployModules(layerPath, functionName, efsId, subnetId);
        }
      }      

      log(`${color().green('[RWS Lambda Service]')} ${color().yellowBright('deploying lambda on ' + this.region + ' using ' + s3BucketName)}`);
      const s3params = {
        Bucket: s3BucketName,
        Key: functionName + '.zip', // File name you want to save as in S3
        Body: zipFile
      };

      try {
        const uplPromise = AWSService.getS3().upload(s3params);

        // AWSProgressBar(uplPromise);

        const s3Data = await uplPromise.promise();

        log(`${color().green('[RWS Lambda Service]')} uploading ${zipPath} to S3Bucket`);

        const s3Path = s3Data.Key;
        const Code = {
          S3Bucket: s3BucketName,
          S3Key: s3Path
        }

        let data = null;

        if (await this.functionExists(functionName)) {
          data = await AWSService.getLambda().updateFunctionCode({
            FunctionName: functionName,
            ...Code
          }).promise();
        } else {
          const createParams: AWS.Lambda.Types.CreateFunctionRequest = {
            FunctionName: functionName,
            Runtime: 'nodejs18.x',
            Role: AppConfigService().get('aws_lambda_role'),
            Handler: 'index.js',
            Code,
            VpcConfig: {
              SubnetIds: [subnetId],  // Add your subnet IDs
              SecurityGroupIds: await AWSService.listSecurityGroups(),  // Add your security group ID
            }
          };        

          data = await AWSService.getLambda().createFunction(createParams).promise()
        }

        await this.waitForLambda(functionName);

        // log(`${color().green('[RWS Lambda Service]')} ${color().yellowBright(`${zipPath} has been deleted after successful deployment`)}`);
        log(`${color().green(`[RWS Lambda Service] lambda function "${functionName}" deployed`)}`);

      } catch (e: Error | any) {
        throw e;
      }

    } catch (err: Error | any) {
      error(err.message);
      log(err.stack)
    }
  }

  async deployModules(layerPath: string, functionName: string, efsId: string, subnetId: string) {
    const _RWS_MODULES_UPLOADED = '_rws_efs_modules_uploaded';
    const savedKey = ProcessService.getRWSVar(_RWS_MODULES_UPLOADED);
    const S3Bucket = getAppConfig().get('aws_lambda_bucket');
    
    if(savedKey){
      await AWSService.uploadToEFS(efsId, savedKey, S3Bucket, subnetId);

      return;
    }

    log(`${color().green('[RWS Lambda Service]')} ${color().yellowBright('deploying lambda modules on ' + this.region + ' using ' + functionName)}`);    

    if(!savedKey){
      const zipFile = fs.readFileSync(layerPath);

      const s3params = {
        Bucket: S3Bucket,
        Key: 'RWS-modules.zip',
        Body: zipFile
      };
  
      const uplPromise = AWSService.getS3().upload(s3params);   


      log(`${color().green('[RWS Lambda Service]')} layer uploading ${layerPath} to S3Bucket`);

      const s3Data = await uplPromise.promise();
      const s3Path = s3Data.Key;

      log(`${color().green('[RWS Lambda Service]')} ${color().yellowBright('lambda layer is uploaded to ' + this.region + ' with key:  ' + s3Path)}`);

      ProcessService.setRWSVar(_RWS_MODULES_UPLOADED, s3Path);      
      await AWSService.uploadToEFS(efsId, s3Path, S3Bucket, subnetId);
    }   
  }  

  async functionExists(functionName: String): Promise<boolean> {
    try {
      await AWSService.getLambda().getFunction({ FunctionName: functionName }).promise();
    } catch (e: Error | any) {
      if (e.code === 'ResourceNotFoundException') {
        return false;
      }
    }

    return true;
  }

  async waitForLambda(functionName: string, timeoutMs: number = 300000, intervalMs: number = 5000): Promise<void> {
    const startTime = Date.now();

    while (Date.now() - startTime < timeoutMs) {
      const { Configuration } = await AWSService.getLambda().getFunction({ FunctionName: functionName }).promise();

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
}

export default LambdaService.getSingleton();