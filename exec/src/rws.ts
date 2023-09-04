#!/usr/bin/env node

import { getAppConfig, IAppConfig, RWSCommand, ICmdParams, ProcessService, ConsoleService } from '@rws-js/server';
import initAction from './helpers/init';
import lambdaAction, { ILambdaParams } from './helpers/lambda';

const { log, warn, error, color } = ConsoleService;


const fs = require('fs');
const path = require('path');
// process.argv[2] will be the first command line argument after `rws`
const command = process.argv[2];
// process.argv[3] will be the parameter args for commands
const cmdParamString = process.argv[3];
const cmdArgs = cmdParamString.length > 2 ? cmdParamString.split(',') : [];

const commandExecutionArgs: ICmdParams = {_default: null};

if(cmdParamString && cmdParamString.indexOf('=') > -1){
    console.log(cmdParamString);
    
    cmdArgs.forEach((arg) => {    
        const argData = arg.split('=');
        commandExecutionArgs[argData[0]] = argData[1];

        if(!commandExecutionArgs._default){
            commandExecutionArgs._default = argData[1];
        }
    });
}else if(!cmdParamString || !cmdArgs.length){
    commandExecutionArgs._default = null;
}else{
    commandExecutionArgs._default = cmdParamString;
}

const executionDir = process.cwd();

const main = async () => {
    const moduleCfgDir = `${executionDir}/node_modules/.rws`;
    const cfgPathFile = `${moduleCfgDir}/_cfg_path`;  
    
 
    const tsFile = path.resolve(__dirname, '..', 'src') + '/rws.ts';    
    
    if(fs.existsSync(cfgPathFile)){
        let savedHash = null;
        const consoleClientHashFile = `${moduleCfgDir}/_cli_hash`;  

        if(fs.existsSync(`${moduleCfgDir}/_cli_hash`)){                 
            savedHash = fs.readFileSync(consoleClientHashFile, 'utf-8');       
        }

        const frameworkConfigFactory: () => IAppConfig = require('@App/' + fs.readFileSync(cfgPathFile, 'utf-8')).default;        
        const APP_CFG = frameworkConfigFactory();                 
        const APP = getAppConfig(APP_CFG);

        const commands: RWSCommand[] = APP.get('commands');    

        const customCommand = commands.find((cmd: RWSCommand) => cmd.getName() == command);

        commandExecutionArgs._rws_config = APP_CFG;

        const cmdFiles = ProcessService.batchGenerateCommandFileMD5(moduleCfgDir);     

        const currentSumHashes = (await ProcessService.generateCliHashes([tsFile, ...cmdFiles])).join('/');

        if(!savedHash || currentSumHashes !== savedHash){            
            fs.writeFileSync(consoleClientHashFile, currentSumHashes);
        }                

        if(customCommand){
            log(color().green('[RWS]') + ' executing custom command ' + customCommand.getName())
            customCommand.execute(commandExecutionArgs);
            
            return;
        }   
    } 

    switch (command) {  
        case 'init':     
            const configPath: string = commandExecutionArgs.config || commandExecutionArgs._default 
            const frameworkConfigFactory: () => IAppConfig = require('@App/' + configPath).default;

            fs.writeFileSync(cfgPathFile, configPath);

            const cfgData = frameworkConfigFactory();
            await initAction(cfgData);  

            break;

        case 'kill':        
            const scriptKillPath: string | null = commandExecutionArgs.path || commandExecutionArgs._default || null;

            if(scriptKillPath){

                await ProcessService.killProcess(scriptKillPath);
                break;
            }

            await ProcessService.killRWS();    

            break;  
            
        case 'run':
            const scriptPath: string = commandExecutionArgs.path || commandExecutionArgs._default 
            const scriptArgs: string[] = commandExecutionArgs.args || [];
            await ProcessService.PM2RunScript(scriptPath, {}, ...scriptArgs);
            break;

        case 'watch':            
            await ProcessService.PM2RunCommandsInParallel([               
                `webpack --config ${executionDir}/webpack.config.js --watch`,     
                `nodemon \"${executionDir}/build/rws.server.js\" --watch \"./build\"`                
            ]);
            break;

        case 'lambda':                
            const subnetId: string = commandExecutionArgs.subnetId || commandExecutionArgs._default;

            await lambdaAction({
                rwsConfig: commandExecutionArgs._rws_config,
                subnetId: subnetId
            });
            
            break;

        default:
            if(!fs.existsSync(cfgPathFile)){
                throw new Error('No config path generated for CLI. Try to initialize with "npx rws init config=path/to/config.ts"');
            }

            ConsoleService.error(`Unknown command: ${command}.`);
    }
}

main().then(() => {    
    process.exit(0);
});