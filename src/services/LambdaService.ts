import TheService from "./_service";

import getAppConfig from "./AppConfigService";
import EFSService from "./EFSService";
import ConsoleService from "./ConsoleService";
import AWSService from "./AWSService";
import ZipService from "./ZipService";
import S3Service from "./S3Service";

import path from 'path';
import fs from 'fs';
import AWS from 'aws-sdk';
import UtilsService from "./UtilsService";


const { log, warn, error, color, AWSProgressBar } = ConsoleService;

const MIN = 60; // 1MIN = 60s

interface InvokeLambdaResponse {
  StatusCode?: number;
  Payload: string;
}

class LambdaService extends TheService {

  private region: string;

  constructor() {
    super();
  }

  async archiveLambda(lambdaDirPath: string, moduleCfgDir: string): Promise<[string, string]> {    
    const lambdaDirName = lambdaDirPath.split('/').filter(Boolean).pop();
    const [lambdaPath, modulesPath] = this.determineLambdaPackagePaths(lambdaDirName, moduleCfgDir);

    
    if (!fs.existsSync(path.join(moduleCfgDir, 'lambda'))) {
      fs.mkdirSync(path.join(moduleCfgDir, 'lambda'));
    }

    // Create archives
    const tasks: Promise<string>[] = [];

    if (!fs.existsSync(modulesPath)) {
      log(`${color().green('[RWS Lambda Service]')} archiving .node_modules from ROOT_DIR to .zip`);
      tasks.push(ZipService.createArchive(modulesPath, `${process.cwd()}/node_modules`, { ignore: [ '.rws/**', '.prisma/**' ] }));
    }
    
    if (fs.existsSync(lambdaPath)) {
      fs.unlinkSync(lambdaPath);
    }

    // if(fs.existsSync(lambdaPath + '/package.json')){
    //   await ProcessService.runShellCommand(`cd ${lambdaPath} && npm install`);
    // }

    log(`${color().green('[RWS Lambda Service]')} archiving ${color().yellowBright(lambdaDirPath)} to:\n ${color().yellowBright(lambdaPath)}`);
    tasks.push(ZipService.createArchive(lambdaPath, lambdaDirPath));       

    await Promise.all(tasks);

    log(`${color().green('[RWS Lambda Service]')} ${color().yellowBright('ZIP package complete.')}`);

    return [lambdaPath, modulesPath];
  }

  determineLambdaPackagePaths(lambdaDirName: string, moduleCfgDir: string): [string, string] {
    const modulesPath = path.join(moduleCfgDir, 'lambda', `RWS-modules.zip`);
    const lambdaPath = path.join(moduleCfgDir, 'lambda', `lambda-${lambdaDirName}-app.zip`);
    return [lambdaPath, modulesPath];
  }

  async deployLambda(functionName: string, appPaths: string[], subnetId?: string, noEFS: boolean = false): Promise<any> {
    const [zipPath, layerPath] = appPaths;

    this.region = getAppConfig().get('aws_lambda_region');

    const zipFile = fs.readFileSync(zipPath);

    try {

      const s3BucketName = getAppConfig().get('aws_lambda_bucket');

      await S3Service.bucketExists(s3BucketName);

      const [efsId, accessPointArn, efsExisted] = await EFSService.getOrCreateEFS('RWS_EFS', subnetId);

      if(!noEFS && !efsExisted){
        await this.deployModules(layerPath, efsId, subnetId);
      }      

      log(`${color().green('[RWS Lambda Service]')} ${color().yellowBright('deploying lambda on ' + this.region)} using ${color().red(`S3://${s3BucketName}/${functionName}.zip`)}`);

      log(`${color().green('[RWS Lambda Service]')} uploading ${color().yellowBright(zipPath)}...`);

      const s3params = {
        Bucket: s3BucketName,
        Key: functionName + '.zip', // File name you want to save as in S3
        Body: zipFile
      };
           
      const s3Data = await S3Service.upload(s3params, true);

      log(`${color().green('[RWS Lambda Service]')} uploaded ${color().yellowBright(zipPath)} to ${color().red(`S3://${s3BucketName}/${functionName}.zip`)}`);
      

      const s3Path = s3Data.Key;
      const Code = {
        S3Bucket: s3BucketName,
        S3Key: s3Path
      }

      let data = null;

      const _HANDLER = 'index.handler';
      const functionDidExist: boolean = await this.functionExists(functionName);

      if (functionDidExist) {
        data = await AWSService.getLambda().updateFunctionCode({
          FunctionName: functionName,
          ...Code
        }).promise();                  
      } else {
        const createParams: AWS.Lambda.Types.CreateFunctionRequest = {
          FunctionName: functionName,
          Runtime: 'nodejs18.x',
          Role: getAppConfig().get('aws_lambda_role'),
          Handler: _HANDLER,
          Code,
          VpcConfig: {
            SubnetIds: [subnetId],  // Add your subnet IDs
            SecurityGroupIds: await AWSService.listSecurityGroups(),  // Add your security group ID
          },
          FileSystemConfigs: [
            {
                Arn: accessPointArn,
                LocalMountPath: '/mnt/efs'  // The path in your Lambda function environment where the EFS will be mounted
            }
          ],
          MemorySize: 2048,
          Timeout: 15 * MIN
        };     
        
        log(color().green('[RWS Lambda Service] is creating Lambda function named: ') + color().yellowBright(functionName));

        data = await AWSService.getLambda().createFunction(createParams).promise()
      }

      await this.waitForLambda(functionName, functionDidExist ? 'creation' : 'update');      
      
      if(functionDidExist){
        const functionInfo = await AWSService.getLambda().getFunction({
          FunctionName: functionName
        }).promise();


        if(functionInfo.Configuration.Handler !== _HANDLER){
          log(color().green('[RWS Lambda Service]') + ' is changing handler for Lambda function named: ' + color().yellowBright(functionName));

          await AWSService.getLambda().updateFunctionConfiguration({
            FunctionName: functionName,
            Handler: _HANDLER
          }, (err, data) => {
            if (err) {
              console.log(err, err.stack);
            } else {
              console.log(data);
            }
          }).promise();

          await this.waitForLambda(functionName, 'handler update');

        }
      }
      
      log(`${color().green(`[RWS Lambda Service] lambda function "${functionName}" deployed`)}`);
    } catch (err: Error | any) {
      error(err.message);
      log(err.stack)
      throw err;
    }
  }

  async deployModules(layerPath: string, efsId: string, subnetId: string, force: boolean = false) {
    const _RWS_MODULES_UPLOADED = '_rws_efs_modules_uploaded';
    const savedKey = !force ? UtilsService.getRWSVar(_RWS_MODULES_UPLOADED) : null;
    const S3Bucket = getAppConfig().get('aws_lambda_bucket');
    
    if(savedKey){
      log(`${color().green('[RWS Lambda Service]')} key saved. Deploying by cache.`);    
      await AWSService.uploadToEFS(efsId, savedKey, S3Bucket, subnetId);

      return;
    }

    log(`${color().green('[RWS Lambda Service]')} ${color().yellowBright('deploying lambda modules on ' + this.region)}`);    

    if(!savedKey){
      const zipFile = fs.readFileSync(layerPath);

      const s3params = {
        Bucket: S3Bucket,
        Key: 'RWS-modules.zip',
        Body: zipFile
      };
    

      log(`${color().green('[RWS Lambda Service]')} layer uploading ${layerPath} to S3Bucket`);

      const s3Data = await S3Service.upload(s3params);
      const s3Path = s3Data.Key;

      log(`${color().green('[RWS Lambda Service]')} ${color().yellowBright('lambda layer is uploaded to ' + this.region + ' with key:  ' + s3Path)}`);

      UtilsService.setRWSVar(_RWS_MODULES_UPLOADED, s3Path);      
      await AWSService.uploadToEFS(efsId, s3Path, S3Bucket, subnetId);
    }   
  }  

  async functionExists(functionName: string): Promise<boolean> {
    try {
      await AWSService.getLambda().getFunction({ FunctionName: functionName }).promise();
    } catch (e: Error | any) {
      if (e.code === 'ResourceNotFoundException') {
        log(e.message)
        return false;
      }
    }

    return true;
  }

  async waitForLambda(functionName: string, waitFor: string = null,timeoutMs: number = 300000, intervalMs: number = 5000): Promise<void> {
    const startTime = Date.now();
    log(`${color().yellowBright('[Lambda Listener] awaiting Lambda ' + (waitFor !== null ? ' (' + waitFor + ')' : '') +' state change')}`);        

    while (Date.now() - startTime < timeoutMs) {
      log(`${color().yellowBright('[Lambda Listener] .')}`);      
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

  async deleteLambda(functionName: string): Promise<void>
  {
    await AWSService.getLambda().deleteFunction({
      FunctionName: functionName
    }).promise();
  }

  async invokeLambda(
    functionName: string,
    payload: any
  ): Promise<{ StatusCode: number, Response: AWS.Lambda.InvocationResponse, CapturedLogs?: string[]}> {
    // const originalConsoleLog = console.log;
  
    // Capture and log messages
    // const capturedLogs = this.captureAndLogMessages();
  
    const params: AWS.Lambda.InvocationRequest = {
      FunctionName: functionName,
      InvocationType: 'RequestResponse',
      Payload: JSON.stringify(payload),
    };

    log(color().green('[RWS Lamda Service]') + ` invoking ${functionName} with payload: '${params.Payload}'`)
  
    const response: AWS.Lambda.InvocationResponse = await AWSService.getLambda()
      .invoke(params)
      .promise();
  
    // Restore the original console.log function
    // console.log = originalConsoleLog;
  
    // Assuming you want to return specific properties from the response
    return {
      StatusCode: response.StatusCode,
      Response: response
    };
  }

  private captureAndLogMessages() : string[]
  {
    const capturedLogs: string[] = [];
        
    console.log = (...args: any[]) => {
      capturedLogs.push(args.join(' '));
    };
    
    return capturedLogs;
  }
}

export default LambdaService.getSingleton();