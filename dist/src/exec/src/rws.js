#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = require("../../src/index");
const { log, warn, error, color, rwsLog } = index_1.ConsoleService;
const fs = require('fs');
const path = require('path');
// process.argv[2] will be the first command line argument after `rws`
const command = process.argv[2];
// process.argv[3] will be the parameter args for commands
const cmdParamString = process.argv[3];
const cmdArgs = !!cmdParamString && cmdParamString.length > 2 ? cmdParamString.split(',') : [];
const commandExecutionArgs = { _default: null, _extra_args: {} };
if (cmdParamString && cmdParamString.indexOf('=') > -1) {
    cmdArgs.forEach((arg) => {
        const argData = arg.split('=');
        commandExecutionArgs[argData[0].replace('--', '')] = argData[1];
        if (!commandExecutionArgs._default) {
            commandExecutionArgs._default = argData[1];
        }
    });
}
else if (!cmdParamString || !cmdArgs.length) {
    commandExecutionArgs._default = null;
}
else {
    commandExecutionArgs._default = cmdParamString;
}
if (process.argv.length > 4) {
    for (let i = 4; i <= process.argv.length - 1; i++) {
        const parameter = process.argv[i].replace('--', '').replace('-', '_');
        const valuePair = parameter.split('=');
        commandExecutionArgs._extra_args[valuePair[0]] = valuePair.length > 1 ? valuePair[1] : true;
    }
}
const executionDir = process.cwd();
function getConfig(configPath, cfgPathFile = null) {
    if (cfgPathFile === null) {
        cfgPathFile = configPath;
        if (cfgPathFile) {
            const rwsConfigVar = index_1.UtilsService.getRWSVar(cfgPathFile);
            if (rwsConfigVar) {
                configPath = rwsConfigVar;
            }
        }
    }
    else {
        index_1.UtilsService.setRWSVar(cfgPathFile, configPath);
    }
    const frameworkConfigFactory = require('@App/' + configPath).default;
    return frameworkConfigFactory();
}
const main = async () => {
    const moduleCfgDir = `${executionDir}/node_modules/.rws`;
    const cfgPathFile = `_cfg_path`;
    const tsFile = path.resolve(__dirname, '..', 'src') + '/rws.ts';
    let APP_CFG = null;
    if (command === 'init') {
        const configPath = commandExecutionArgs.config || commandExecutionArgs._default;
        const cfgData = getConfig(configPath, cfgPathFile);
        APP_CFG = cfgData;
    }
    let savedHash = null;
    const consoleClientHashFile = `${moduleCfgDir}/_cli_hash`;
    if (fs.existsSync(`${moduleCfgDir}/_cli_hash`)) {
        savedHash = fs.readFileSync(consoleClientHashFile, 'utf-8');
    }
    if (!APP_CFG) {
        APP_CFG = getConfig(cfgPathFile);
    }
    if (!APP_CFG) {
        throw new Error('No config for CLI. Try to initialize with "npx rws init config=path/to/config.ts"');
    }
    const APP = (0, index_1.getAppConfig)(APP_CFG);
    const commands = [...index_1.RWSAppCommands, ...APP.get('commands')];
    const theCommand = commands.find((cmd) => cmd.getName() == command);
    commandExecutionArgs._rws_config = APP_CFG;
    const cmdFiles = index_1.MD5Service.batchGenerateCommandFileMD5(moduleCfgDir);
    const currentSumHashes = (await index_1.MD5Service.generateCliHashes([tsFile, ...cmdFiles])).join('/');
    if (!savedHash || currentSumHashes !== savedHash) {
        fs.writeFileSync(consoleClientHashFile, currentSumHashes);
    }
    if (theCommand) {
        await theCommand.execute(commandExecutionArgs);
        return;
    }
    if (!fs.existsSync(`${moduleCfgDir}/${cfgPathFile}`)) {
        throw new Error('No config path generated for CLI. Try to initialize with "npx rws init config=path/to/config.ts"');
    }
    error(`Unknown command: ${command}.`);
    return;
};
main().then(() => {
    process.exit(0);
});
//# sourceMappingURL=rws.js.map