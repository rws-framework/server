import TheService from "./_service";

import getAppConfig from "./AppConfigService";
import EFSService from "./EFSService";
import ConsoleService from "./ConsoleService";
import AWSService from "./AWSService";
import ZipService from "./ZipService";
import S3Service from "./S3Service";
import APIGatewayService from "./APIGatewayService";

import path from 'path';
import fs from 'fs';
import AWS from 'aws-sdk';
import UtilsService from "./UtilsService";
import ProcessService from "./ProcessService";
import VPCService from "./VPCService";


const { log, warn, error, color, rwsLog } = ConsoleService;

const MIN = 60; // 1MIN = 60s

interface InvokeLambdaResponse {
  StatusCode?: number;
  Payload: string;
}

type InvocationTypeType = 'RequestResponse' | 'Event' | 'DryDrun';

interface INPMPackage {
  name: string
  version: string
  description?: string
  author?: string
  license?: string
  type?: string

  dependencies?: {    
    [packageName: string]: string
  }

  deployConfig?: {
    webLambda?: boolean
    invocationType?: InvocationTypeType
  }
}


class LambdaService extends TheService {

  private region: string;

  constructor() {
    super();
  }

  async archiveLambda(lambdaDirPath: string, moduleCfgDir: string, fullZip: boolean = false): Promise<string> {    
    const lambdaDirName = lambdaDirPath.split('/').filter(Boolean).pop();
    const lambdaPath = path.join(moduleCfgDir, 'lambda', `RWS-${lambdaDirName}-app.zip`);
    
    if (!fs.existsSync(path.join(moduleCfgDir, 'lambda'))) {
      fs.mkdirSync(path.join(moduleCfgDir, 'lambda'));
    }

    // Create archives
    const tasks: Promise<string>[] = [];
    
    if (fs.existsSync(lambdaPath)) {
      fs.unlinkSync(lambdaPath);
    }

    // if(fs.existsSync(lambdaPath + '/package.json')){
    //   await ProcessService.runShellCommand(`cd ${lambdaPath} && npm install`);
    // }
    const toolsFile = `${path.resolve(lambdaDirPath, '..')}/tools.js`;
    const targetToolsFile = `${lambdaDirPath}/tools.js`;
    
    fs.copyFileSync(toolsFile, targetToolsFile);    

    log(`${color().green('[RWS Lambda Service]')} archiving ${color().yellowBright(lambdaDirPath)} to:\n ${color().yellowBright(lambdaPath)}`);
    tasks.push(ZipService.createArchive(lambdaPath, lambdaDirPath, fullZip ? null : {
      'ignore': ['node_modules/**/*']
    }));       

    await Promise.all(tasks);

    fs.unlinkSync(targetToolsFile);

    log(`${color().green('[RWS Lambda Service]')} ${color().yellowBright('ZIP package complete.')}`);

    return lambdaPath;
  }

  determineLambdaPackagePaths(lambdaDirName: string, moduleCfgDir: string): [string, string] {
    const modulesPath = path.join(moduleCfgDir, 'lambda', `RWS-modules.zip`);
    const lambdaPath = path.join(moduleCfgDir, 'lambda', `lambda-${lambdaDirName}-app.zip`);
    return [lambdaPath, modulesPath];
  }

  setRegion(region: string)
  {
    this.region = region;
  }

  async deployLambda(functionDirName: string, zipPath: string, vpcId: string, subnetId?: string, noEFS: boolean = false): Promise<any> {
    this.region = getAppConfig().get('aws_lambda_region');

    const zipFile = fs.readFileSync(zipPath);

    try {

      const s3BucketName = getAppConfig().get('aws_lambda_bucket');

      await S3Service.bucketExists(s3BucketName);

      const [efsId, accessPointArn, efsExisted] = await EFSService.getOrCreateEFS('RWS_EFS', vpcId, subnetId);   

      log(`${color().green('[RWS Lambda Service]')} ${color().yellowBright('deploying lambda on ' + this.region)} using ${color().red(`S3://${s3BucketName}/${functionDirName}.zip`)}`);

      log(`${color().green('[RWS Lambda Service]')} uploading ${color().yellowBright(zipPath)}...`);

      const s3params = {
        Bucket: s3BucketName,
        Key: 'RWS-' + functionDirName + '.zip', // File name you want to save as in S3
        Body: zipFile
      };
           
      const s3Data = await S3Service.upload(s3params, true);      
      log(`${color().green('[RWS Lambda Service]')} uploaded ${color().yellowBright(zipPath)} to ${color().red(`S3://${s3BucketName}/RWS-${functionDirName}.zip`)}`);
      

      const s3Path = s3Data.Key;
      const Code = {
        S3Bucket: s3BucketName,
        S3Key: s3Path
      }

      const lambdaFunctionName= 'RWS-' + functionDirName

      const _HANDLER = 'index.handler';
      const functionDidExist: boolean = await this.functionExists(lambdaFunctionName);      

      if (functionDidExist) {
        await AWSService.getLambda().updateFunctionCode({
          FunctionName: lambdaFunctionName,
          ...Code
        }).promise();                  
      } else {
        const createParams: AWS.Lambda.Types.CreateFunctionRequest = {
          FunctionName: lambdaFunctionName,
          Runtime: 'nodejs18.x',
          Role: getAppConfig().get('aws_lambda_role'),
          Handler: _HANDLER,
          Code,
          VpcConfig: {
            SubnetIds: [subnetId],  // Add your subnet IDs
            SecurityGroupIds: await VPCService.listSecurityGroups(),  // Add your security group ID
          },
          FileSystemConfigs: [
            {
                Arn: accessPointArn,
                LocalMountPath: '/mnt/efs'  // The path in your Lambda function environment where the EFS will be mounted
            }
          ],
          MemorySize: 2048,
          Timeout: 15 * MIN,
          Environment: {
            Variables: {
              NODE_PATH: '/mnt/efs/res/modules/' + functionDirName,
              HOME: '/mnt/efs/res/tmp/' + functionDirName
            }
          }
        };     
        
        log(color().green('[RWS Lambda Service] is ' + (functionDidExist ? 'updating' : 'creating') + ' lambda function named: ') + color().yellowBright(lambdaFunctionName));

        await AWSService.getLambda().createFunction(createParams).promise()
      }    

      await this.waitForLambda(functionDirName, functionDidExist ? 'update' : 'creation');      
      
      if(functionDidExist){
        const functionInfo = await this.getLambdaFunction(lambdaFunctionName);

        if(functionInfo.Configuration.Handler !== _HANDLER){
          log(color().green('[RWS Lambda Service]') + ' is changing handler for Lambda function named: ' + color().yellowBright(lambdaFunctionName));

          await AWSService.getLambda().updateFunctionConfiguration({
            FunctionName: lambdaFunctionName,
            Handler: _HANDLER
          }, (err, data) => {
            if (err) {
              console.log(err, err.stack);
            } else {
              console.log(data);
            }
          }).promise();

          await this.waitForLambda(functionDirName, 'handler update');

          // await S3Service.delete({
          //   Bucket: s3params.Bucket,
          //   Key: s3params.Key
          // });

          // rwsLog('Deleting S3 Object after deploy: ' + color().red(`s3://${s3params.Bucket}/${s3params.Key}`));
        }
      }
      
      rwsLog('RWS Lambda Service', `lambda function "${lambdaFunctionName}" has been ${functionDidExist ? 'created' : 'updated'}`);

      const npmPackage = this.getNPMPackage(functionDirName);

      if((!!npmPackage.deployConfig) && npmPackage.deployConfig.webLambda === true){                

        if((await APIGatewayService.findApiGateway(lambdaFunctionName)) === null){
          await this.setupGatewayForWebLambda(lambdaFunctionName, vpcId);
        }

        if(!(await VPCService.findPublicSubnetInVPC(vpcId))){                   
          await APIGatewayService.associateNATGatewayWithLambda(lambdaFunctionName);
        }
      }      
    } catch (err: Error | any) {
      error(err.message);
      log(err.stack)
      throw err;
    }
  }

  getNPMPackage(lambdaDirName: string): INPMPackage
  {
    const moduleDir = path.resolve(__dirname, '..', '..').replace('dist/', '');
    const npmPackagePath = `${moduleDir}/lambda-functions/${lambdaDirName}/package.json`;

    if(!fs.existsSync(npmPackagePath)){
        throw new Error(`The lambda folder "${lambdaDirName}" has no package.json inside.`)
    }

    return JSON.parse(fs.readFileSync(npmPackagePath, 'utf-8'));
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

      const s3Data = await S3Service.upload(s3params);
      const s3Path = s3Data.Key;

      // fs.unlinkSync(packagePath);      

      log(`${color().green('[RWS Lambda Service]')} ${color().yellowBright('NPM package file is uploaded to ' + this.region + ' with key:  ' + s3Path)}`);

      UtilsService.setRWSVar(_RWS_MODULES_UPLOADED, s3Path);      
      await EFSService.uploadToEFS(functionName, efsId, s3Path, S3Bucket, vpcId, subnetId);

      // await S3Service.delete({
      //   Bucket: s3params.Bucket,
      //   Key: s3params.Key
      // });

      // rwsLog('Deleting S3 Object after module deploy: ' + color().red(`s3://${s3params.Bucket}/${s3params.Key}`));
    }   
  }  

  async getLambdaFunction(lambdaFunctionName: string): Promise<AWS.Lambda.GetFunctionResponse | null>
  {
    try {
      return await AWSService.getLambda().getFunction({ FunctionName: lambdaFunctionName }).promise();
    } catch (e: Error | any) {
      return null;
    }    
  }

  async functionExists(lambdaFunctionName: string): Promise<boolean> {
    return !!(await this.getLambdaFunction(lambdaFunctionName)); 
  }

  async waitForLambda(functionName: string, waitFor: string = null,timeoutMs: number = 300000, intervalMs: number = 5000): Promise<void> {
    const lambdaFunctionName = 'RWS-' + functionName;
    const startTime = Date.now();
    log(`${color().yellowBright('[Lambda Listener] awaiting Lambda' + (waitFor !== null ? ' (' + waitFor + ')' : '') +' state change')}`);        

    while (Date.now() - startTime < timeoutMs) {
      log(`${color().yellowBright('[Lambda Listener] .')}`);      
      const { Configuration } = await this.getLambdaFunction(lambdaFunctionName);

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

  async deleteLambda(lambdaFunctionName: string): Promise<void>
  {

    const restApi = await APIGatewayService.findApiGateway(lambdaFunctionName);

    await APIGatewayService.deleteApiGateway(restApi.id);

    await AWSService.getLambda().deleteFunction({
      FunctionName: lambdaFunctionName
    }).promise();
  }

  async invokeLambda(
    functionDirName: string,
    payload: any,    
  ): Promise<{ StatusCode: number, Response: AWS.Lambda.InvocationResponse, CapturedLogs?: string[]}> {

    let invocationType: InvocationTypeType = 'RequestResponse';

    const npmPackage = this.getNPMPackage(functionDirName);

    if(!!npmPackage.deployConfig && npmPackage.deployConfig.invocationType){
      invocationType = npmPackage.deployConfig.invocationType;
    }

    if(!!payload._invocationConfig){
      error('HEEEEEEREEEEEEE')
      const invocationConfig = payload._invocationConfig;
      invocationType = invocationConfig.invocationType;
      console.log(payload._invocationConfig);
      delete payload['_invocationConfig'];
      console.log(payload._invocationConfig);
    }

    const params: AWS.Lambda.InvocationRequest = {
      FunctionName: 'RWS-' + functionDirName,
      InvocationType: invocationType,
      Payload: JSON.stringify(payload),
    };

    log(color().green('[RWS Lambda Service]') + color().yellowBright(` invoking (with ${invocationType} type) "RWS-${functionDirName}" with payload: `));    
    log(payload);
  
    try {
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
    } catch(e: Error | any) {
      error(e.message);
      throw new Error(e);
    }
  }  

  async retrieveCloudWatchLogs(logResult: string, functionName: string): Promise<string[]> {
    const cloudWatchLogs = new AWS.CloudWatchLogs();
  
    const params: AWS.CloudWatchLogs.GetLogEventsRequest = {
      logGroupName: `/aws/lambda/${functionName}`, // Update with your Lambda function name
      logStreamName: logResult,
    };
  
    const logs: string[] = [];
  
    const getLogs = async (nextToken: string | undefined = undefined): Promise<void> => {
      if (nextToken) {
        params.nextToken = nextToken;
      }
  
      const response = await cloudWatchLogs.getLogEvents(params).promise();
  
      if (response.events) {
        for (const event of response.events) {
          logs.push(event.message || '');
        }
      }
  
      // if (response.nextToken) {
      //   await getLogs(response.nextToken);
      // }
    };
  
    await getLogs();
  
    return logs;
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

  async integrateGatewayResource(lambdaFunctionName: string, restApiId: string, resource: AWS.APIGateway.Resource, httpMethod = 'GET')
  {

    const lambdaInfo = await this.getLambdaFunction(lambdaFunctionName);
    const lambdaArn =  lambdaInfo.Configuration.FunctionArn;

    await AWSService.getAPIGateway().putIntegration({
      restApiId: restApiId,
      resourceId: resource.id,
      httpMethod: httpMethod,
      type: "AWS_PROXY",
      integrationHttpMethod: "POST",
      uri: `arn:aws:apigateway:${AWSService.getRegion()}:lambda:path/2015-03-31/functions/${lambdaArn}/invocations`
    }).promise();    
  }

  async setupGatewayForWebLambda(lambdaFunctionName: string, vpcId: string): Promise<void>
  {

    rwsLog('Creating API Gateway for Web Lambda...')
    const restApiId = await APIGatewayService.createApiGateway(lambdaFunctionName);
    const resource = await APIGatewayService.createResource(restApiId, lambdaFunctionName);

    const httpMethods = ['GET', 'POST', 'PUT', 'DELETE'];
    const apiMethods = [];

    rwsLog('Pushing methods to API Gateway resource.')

    for (let methodKey in httpMethods){
      apiMethods.push(await APIGatewayService.createMethod(restApiId, resource, httpMethods[methodKey]));
    }    

    rwsLog(`Integrating API Gateway resource with "${color().yellowBright(lambdaFunctionName)}" lambda function.`);

    for (let apiMethodKey in apiMethods){
      const apiMethod: AWS.APIGateway.Method = apiMethods[apiMethodKey];
      await this.integrateGatewayResource(lambdaFunctionName, restApiId, resource, apiMethod.httpMethod);
    }    

    await AWSService.getAPIGateway().createDeployment({
      restApiId: restApiId,
      stageName: "prod"
    }).promise();    

    rwsLog(`API Gateway "${color().yellowBright(lambdaFunctionName+'-API')}" deployed.`);

  }
}

export default LambdaService.getSingleton();