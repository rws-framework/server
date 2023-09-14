import TheService from "./_service";
import getAppConfig from "./AppConfigService";
import EFSService from "./EFSService";
import ConsoleService from "./ConsoleService";
import AWSService from "./AWSService";
import ZipService from "./ZipService";
import S3Service from "./S3Service";

import path from 'path';
import fs from 'fs';

import UtilsService from "./UtilsService";
import ProcessService from "./ProcessService";

import {
  CreateFunctionCommand,
  DeleteFunctionCommand,
  GetFunctionCommand,
  InvocationType,
  InvokeCommand,
  LambdaClient,
  UpdateFunctionCodeCommand,
  UpdateFunctionConfigurationCommand
} from "@aws-sdk/client-lambda";

const { log, warn, error, color, AWSProgressBar, rwsLog } = ConsoleService;

const MIN = 60; // 1MIN = 60s

interface InvokeLambdaResponse {
  StatusCode?: number;
  Payload: string;
}

type InvocationTypeType = 'RequestResponse' | 'Event' | 'DryDrun';

class LambdaService extends TheService {

  private region: string;

  constructor() {
    super();
  }

  async archiveLambda(
    lambdaDirPath: string,
    moduleCfgDir: string,
    fullZip: boolean = false
  ): Promise<string> {
    const lambdaDirName = lambdaDirPath.split("/").filter(Boolean).pop();
    const lambdaPath = path.join(
      moduleCfgDir,
      "lambda",
      `RWS-${lambdaDirName}-app.zip`
    );

    if (!fs.existsSync(path.join(moduleCfgDir, "lambda"))) {
      fs.mkdirSync(path.join(moduleCfgDir, "lambda"));
    }

    // Create archives
    const tasks: Promise<string>[] = [];

    if (fs.existsSync(lambdaPath)) {
      fs.unlinkSync(lambdaPath);
    }

    const toolsFile = `${path.resolve(lambdaDirPath, "..")}/tools.js`;
    const targetToolsFile = `${lambdaDirPath}/tools.js`;

    fs.copyFileSync(toolsFile, targetToolsFile);

    log(
      `${color().green("[RWS Lambda Service]")} archiving ${color().yellowBright(
        lambdaDirPath
      )} to:\n ${color().yellowBright(lambdaPath)}`
    );
    tasks.push(
      ZipService.createArchive(lambdaPath, lambdaDirPath, fullZip ? null : {
        ignore: ["node_modules/**/*"],
      })
    );

    await Promise.all(tasks);

    fs.unlinkSync(targetToolsFile);

    log(`${color().green("[RWS Lambda Service]")} ${color().yellowBright("ZIP package complete.")}`);

    return lambdaPath;
  }

  determineLambdaPackagePaths(lambdaDirName: string, moduleCfgDir: string): [string, string] {
    const modulesPath = path.join(moduleCfgDir, "lambda", `RWS-modules.zip`);
    const lambdaPath = path.join(moduleCfgDir, "lambda", `lambda-${lambdaDirName}-app.zip`);
    return [lambdaPath, modulesPath];
  }

  setRegion(region: string)
  {
    this.region = region;
  }

  async deployLambda(
    functionDirName: string,
    zipPath: string,
    vpcId: string,
    subnetId?: string,
    noEFS: boolean = false
  ): Promise<any> {
    this.region = getAppConfig().get("aws_lambda_region");

    const zipFile = fs.readFileSync(zipPath);

    try {
      const s3BucketName = getAppConfig().get("aws_lambda_bucket");

      await S3Service.bucketExists(s3BucketName);

      const [efsId, accessPointArn, efsExisted] = await EFSService.getOrCreateEFS(
        "RWS_EFS",
        vpcId,
        subnetId
      );

      log(
        `${color().green("[RWS Lambda Service]")} ${color().yellowBright(
          "deploying lambda on " + this.region
        )} using ${color().red(`S3://${s3BucketName}/${functionDirName}.zip`)}`
      );

      log(`${color().green("[RWS Lambda Service]")} uploading ${color().yellowBright(zipPath)}...`);

      const s3params = {
        Bucket: s3BucketName,
        Key: "RWS-" + functionDirName + ".zip", // File name you want to save as in S3
        Body: zipFile,
      };

      await S3Service.upload(s3params, true);

      log(
        `${color().green("[RWS Lambda Service]")} uploaded ${color().yellowBright(
          zipPath
        )} to ${color().red(`S3://${s3BucketName}/RWS-${functionDirName}.zip`)}`
      );

      const s3Path = s3params.Key; // Use the Key from s3params instead of s3Data.Key
      const Code = {
        S3Bucket: s3BucketName,
        S3Key: s3Path,
      };

      let data = null;

      const lambdaFunctionName = "RWS-" + functionDirName;

      const _HANDLER = "index.handler";
      const functionDidExist: boolean = await this.functionExists(lambdaFunctionName);

      if (functionDidExist) {
        data = await AWSService.getLambda().send(
          new UpdateFunctionCodeCommand({
            FunctionName: lambdaFunctionName,
            ...Code,
          })
        );
      } else {
        const createParams = {
          FunctionName: lambdaFunctionName,
          Runtime: "nodejs18.x",
          Role: getAppConfig().get("aws_lambda_role"),
          Handler: _HANDLER,
          Code,
          VpcConfig: {
            SubnetIds: [subnetId], // Add your subnet IDs
            SecurityGroupIds: await AWSService.listSecurityGroups(), // Add your security group ID
          },
          FileSystemConfigs: [
            {
              Arn: accessPointArn,
              LocalMountPath: "/mnt/efs", // The path in your Lambda function environment where the EFS will be mounted
            },
          ],
          MemorySize: 2048,
          Timeout: 15 * MIN,
        };

        log(
          color().green("[RWS Lambda Service]") +
          " is creating Lambda function named: " +
          color().yellowBright(lambdaFunctionName)
        );

        data = await AWSService.getLambda().send(new CreateFunctionCommand(createParams));
      }

      await this.waitForLambda(functionDirName, functionDidExist ? "creation" : "update");

      if (functionDidExist) {
        const functionInfo = await AWSService.getLambda().send(
          new GetFunctionCommand({
            FunctionName: lambdaFunctionName,
          })
        );

        if (functionInfo.Configuration.Handler !== _HANDLER) {
          log(
            color().green("[RWS Lambda Service]") +
            " is changing handler for Lambda function named: " +
            color().yellowBright(lambdaFunctionName)
          );

          await AWSService.getLambda().send(
            new UpdateFunctionConfigurationCommand({
              FunctionName: lambdaFunctionName,
              Handler: _HANDLER,
            })
          );
        }

        log(
          color().green("[RWS Lambda Service]") +
          " has successfully updated code for Lambda function named: " +
          color().yellowBright(lambdaFunctionName)
        );
      }

      return data;
    } catch (e: any) {
      if (e && e.message && e.message.indexOf("No updates are to be performed") > -1) {
        log(
          color().green("[RWS Lambda Service]") +
          " had no updates for Lambda function named: " +
          color().yellowBright("RWS-" + functionDirName)
        );
      } else {
        warn(color().green("[RWS Lambda Service]") + " encountered an error while deploying: ");
        throw e;
      }
    }
  }

  async deployModules(functionName: string, efsId: string, vpcId: string, subnetId: string, force: boolean = false) {
    const _RWS_MODULES_UPLOADED = '_rws_efs_modules_uploaded';
    const savedKey = !force ? UtilsService.getRWSVar(_RWS_MODULES_UPLOADED) : null;
    const S3Bucket = getAppConfig().get('aws_lambda_bucket');
    const moduleDir = path.resolve(__dirname, '..', '..').replace('dist/', '');    

    if(!this.region){
      this.region = getAppConfig().get('aws_lambda_region');
    }

    if(savedKey){
      log(`${color().green('[RWS Lambda Service]')} key saved. Deploying by cache.`);    
      await EFSService.uploadToEFS(functionName, efsId, savedKey, S3Bucket, vpcId,subnetId);

      return;
    }

    log(`${color().green('[RWS Lambda Service]')} ${color().yellowBright('deploying lambda modules on ' + this.region)}`);    

    if(!savedKey){      
      const oldDir = process.cwd();
      process.chdir(`${moduleDir}/lambda-functions/${functionName}`);

      rwsLog(`installing ${functionName} modules...`);

      await ProcessService.runShellCommand(`npm install`, true);

      rwsLog(color().green(`${functionName} modules have been installed.`));      

      process.chdir(oldDir);

      const packagePath = `${moduleDir}/lambda-functions/${functionName}/node_modules`;

      const zipPath = await ZipService.createArchive(`${process.cwd()}/node_modules/.rws/lambda/RWS-${functionName}-modules.zip`, packagePath);

      const s3params = {
        Bucket: S3Bucket,
        Key: `RWS-${functionName}-modules.zip`,
        Body: fs.readFileSync(zipPath)
      };
    
      log(`${color().green('[RWS Lambda Service]')} package file uploading ${zipPath} to S3Bucket`);

      await S3Service.upload(s3params);
      const s3Path = s3params.Key;

      log(`${color().green('[RWS Lambda Service]')} ${color().yellowBright('NPM package file is uploaded to ' + this.region + ' with key:  ' + s3Path)}`);

      UtilsService.setRWSVar(_RWS_MODULES_UPLOADED, s3Path);      
      await EFSService.uploadToEFS(functionName, efsId, s3Path, S3Bucket, vpcId, subnetId);
    }   
  }  

  async functionExists(lambdaFunctionName: string): Promise<boolean> {
    try {
      await AWSService.getLambda().send(new GetFunctionCommand({ FunctionName: lambdaFunctionName }));
    } catch (e: Error | any) {
      if (e.code === 'ResourceNotFoundException') {
        log(e.message);
        return false;
      }
    }

    return true;
  }

  async waitForLambda(functionName: string, waitFor: string = null,timeoutMs: number = 300000, intervalMs: number = 5000): Promise<void> {
    const lambdaFunctionName = 'RWS-' + functionName;
    const startTime = Date.now();
    log(`${color().yellowBright('[Lambda Listener] awaiting Lambda ' + (waitFor !== null ? ' (' + waitFor + ')' : '') +' state change')}`);        

    while (Date.now() - startTime < timeoutMs) {
      log(`${color().yellowBright('[Lambda Listener] .')}`);      
      const { Configuration } = await AWSService.getLambda().send(new GetFunctionCommand({ FunctionName: lambdaFunctionName }));

      if (Configuration.State === 'Active') {
        return; // Lambda is active and ready
      }

      // If the state is 'Failed', you can either throw an error or handle it differently based on your use case
      if (Configuration.State === 'Failed') {
        throw new Error(`Lambda function ${lambdaFunctionName} failed to be ready. Reason: ${Configuration.StateReason}`);
      }

      // Wait for the specified interval
      await new Promise(resolve => setTimeout(resolve, intervalMs));
    }

    throw new Error(`Lambda function ${lambdaFunctionName} did not become ready within ${timeoutMs}ms.`);
  }

  async deleteLambda(functionName: string): Promise<void> {
    try {
      const lambdaClient = new LambdaClient({ region: 'your-region' }); // Replace 'your-region' with your AWS region
      await lambdaClient.send(new DeleteFunctionCommand({ FunctionName: functionName }));
    } catch (e) {
      // Handle delete error
      throw e;
    }
  }

  async invokeLambda(
    functionName: string,
    payload: any,
    invocationType: InvocationType = 'RequestResponse'
  ): Promise<{ StatusCode: number, Response: any, CapturedLogs?: string[] }> {
    const lambdaClient = new LambdaClient({ region: 'your-region' }); // Replace 'your-region' with your AWS region
  
    const params = {
      FunctionName: 'RWS-' + functionName,
      InvocationType: invocationType,
      Payload: JSON.stringify(payload),
    };
  
    try {
      const response = await lambdaClient.send(new InvokeCommand(params));
      return {
        StatusCode: response.StatusCode ?? 200, // Adjust the default status code as needed
        Response: JSON.parse(response.Payload?.toString() ?? '{}'), // Parse the response payload
      };
    } catch (e) {
      // Handle invocation error
      throw e;
    }
  }

  findPayload(lambdaArg: string): string
  {
    const executionDir = process.cwd();

    const filePath:string = module.id;        
    
    const moduleDir = path.resolve(__dirname, '..', '..').replace('dist/', '');
    const moduleCfgDir = `${executionDir}/node_modules/.rws`;    

    let payloadPath = `${executionDir}/payloads/${lambdaArg}.json`;
    
    if(!fs.existsSync(payloadPath)){
        rwsLog(color().yellowBright(`No payload file in "${payloadPath}"`));      
        const rwsPayloadPath = `${moduleDir}/payloads/${lambdaArg}.json`

        if(!fs.existsSync(rwsPayloadPath)){                    
            rwsLog(color().red(`Found the payload file in "${rwsPayloadPath}"`));    
            throw new Error(`No payload`);
        }else{
          rwsLog(color().green(`No payload file in "${payloadPath}"`));      

            payloadPath = rwsPayloadPath;
        }                                
    }

    return payloadPath;
  }
}

export default LambdaService.getSingleton();
