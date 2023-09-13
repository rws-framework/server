#!/usr/bin/env node

import { RWSAppCommands, getAppConfig, IAppConfig, RWSCommand, ICmdParams, ProcessService, ConsoleService, MD5Service, UtilsService } from '../../src/index';

const { log, warn, error, color } = ConsoleService;


const fs = require('fs');
const path = require('path');
// process.argv[2] will be the first command line argument after `rws`
const command = process.argv[2];
// process.argv[3] will be the parameter args for commands
const cmdParamString = process.argv[3];
const cmdArgs = !!cmdParamString && cmdParamString.length > 2 ? cmdParamString.split(',') : [];

const commandExecutionArgs: ICmdParams = { _default: null };

if (cmdParamString && cmdParamString.indexOf('=') > -1) {
    cmdArgs.forEach((arg) => {
        const argData = arg.split('=');
        commandExecutionArgs[argData[0]] = argData[1];

        if (!commandExecutionArgs._default) {
            commandExecutionArgs._default = argData[1];
        }
    });
} else if (!cmdParamString || !cmdArgs.length) {
    commandExecutionArgs._default = null;
} else {
    commandExecutionArgs._default = cmdParamString;
}

const executionDir = process.cwd();

function getConfig(configPath: string, cfgPathFile: string | null = null) 
{    
    if(cfgPathFile === null){
        cfgPathFile = configPath;

        if(cfgPathFile){
            const rwsConfigVar = UtilsService.getRWSVar(cfgPathFile);

            if(rwsConfigVar){
                configPath = rwsConfigVar;
            }
        }      
    } else {
        UtilsService.setRWSVar(cfgPathFile, configPath);
    }    

    const frameworkConfigFactory: () => IAppConfig = require('@App/' + configPath).default;
    return frameworkConfigFactory();
}

const main = async () => {
    const moduleCfgDir = `${executionDir}/node_modules/.rws`;
    const cfgPathFile = `_cfg_path`;


    const tsFile = path.resolve(__dirname, '..', 'src') + '/rws.ts';
    let APP_CFG: IAppConfig | null = null;

    if (command === 'init') {
        const configPath: string = commandExecutionArgs.config || commandExecutionArgs._default        

        const cfgData = getConfig(configPath, cfgPathFile);        

        APP_CFG = cfgData;

        console.log(APP_CFG);

    }

    let savedHash = null;
    const consoleClientHashFile = `${moduleCfgDir}/_cli_hash`;

    if (fs.existsSync(`${moduleCfgDir}/_cli_hash`)) {
        savedHash = fs.readFileSync(consoleClientHashFile, 'utf-8');
    }

    if(!APP_CFG){
        APP_CFG = getConfig(cfgPathFile);    
                
    }

    if(!APP_CFG){
        throw new Error('No config for CLI. Try to initialize with "npx rws init config=path/to/config.ts"');
    }

    const APP = getAppConfig(APP_CFG);

    const commands: RWSCommand[] = [...RWSAppCommands, ...APP.get('commands')];

    const theCommand = commands.find((cmd: RWSCommand) => cmd.getName() == command);
    
    commandExecutionArgs._rws_config = APP_CFG;


    const cmdFiles = MD5Service.batchGenerateCommandFileMD5(moduleCfgDir);
    const currentSumHashes = (await MD5Service.generateCliHashes([tsFile, ...cmdFiles])).join('/');

    if (!savedHash || currentSumHashes !== savedHash) {
        fs.writeFileSync(consoleClientHashFile, currentSumHashes);
    }

    if (theCommand) {        
        await theCommand.execute(commandExecutionArgs);

        return;
    }

    switch (command) {
        case 'run':
            const scriptPath: string = commandExecutionArgs.path || commandExecutionArgs._default
            const scriptArgs: string[] = commandExecutionArgs.args || [];
            await ProcessService.PM2ExecCommand(scriptPath, { args: scriptArgs });
            break;

        case 'watch':
            await ProcessService.PM2RunCommandsInParallel([
                `webpack --config ${executionDir}/webpack.config.js --watch`,
                `nodemon \"${executionDir}/build/rws.server.js\" --watch \"./build\"`
            ]);
            break;

        default:
            if (!fs.existsSync(`${moduleCfgDir}/${cfgPathFile}`)) {
                throw new Error('No config path generated for CLI. Try to initialize with "npx rws init config=path/to/config.ts"');
            }

            ConsoleService.error(`Unknown command: ${command}.`);
    }
}

main().then(() => {
    process.exit(0);
});