#!/usr/bin/env node

const path = require('path');
const fs = require('fs');

const Compile_Directives = {
    'recompile': '--reload'
}

let forceReload = false;

const command2map = process.argv[2];
let args = process.argv[3] || '';

const extraArgsAggregated = [];


const { spawn, exec } = require('child_process');
const crypto = require('crypto');
const ProcessService = require('../dist/src/services/ProcessService').default;
const ConsoleService = require('../dist/src/services/ConsoleService').default;
const MD5Service = require('../dist/src/services/MD5Service').default;
const UtilsService = require('../dist/src/services/UtilsService').default;

const { filterNonEmpty } = UtilsService;
const { log, warn, error, color } = ConsoleService;


for(let argvKey in process.argv){
    if(process.argv[argvKey] == '--reload'){
        forceReload = true;
    }      
}

if(process.argv.length > 4){
    for(let i = 4; i <= process.argv.length-1;i++){
        if(!Object.keys(Compile_Directives).map((key) => Compile_Directives[key]).includes(process.argv[i])){
            extraArgsAggregated.push(process.argv[i]);
        }else{
            if(process.argv[i] == '--reload'){
                forceReload = true;
            }
        }        
    }
}

if(command2map === 'init'){
    forceReload = true;
}

const os = require('os');

const totalMemoryBytes = os.totalmem();
const totalMemoryKB = totalMemoryBytes / 1024;
const totalMemoryMB = totalMemoryKB / 1024;
const totalMemoryGB = totalMemoryMB / 1024;


const webpackPath = path.resolve(__dirname, '..');

const packageRootDir = UtilsService.findRootWorkspacePath(process.cwd())

const moduleCfgDir = `${packageRootDir}/node_modules/.rws`;
const cfgPathFile = `${moduleCfgDir}/_cfg_path`;  

const main = async () => {    
    if(fs.existsSync(cfgPathFile)){
        process.env.WEBPACK_CFG_FILE = fs.readFileSync(cfgPathFile, 'utf-8');
    }else{
        process.env.WEBPACK_CFG_FILE = args?.config || 'config/config';    
    }    
    
    await generateCliClient();        

    log(`${color().green('[RWS]')} generated CLI client executing ${command2map} command`, `${webpackPath}/exec/dist/rws.js ${command2map} ${args}`);  

    try {
        await ProcessService.runShellCommand(`node ${webpackPath}/exec/dist/rws.js ${command2map} ${args}`, process.cwd());
    } catch(err) {
        error(err);
    }

    return;
}

async function generateCliClient()
{    
    const consoleClientHashFile = `${moduleCfgDir}/_cli_hash`;       

    if(!fs.existsSync(moduleCfgDir)){
        fs.mkdirSync(moduleCfgDir);
    }

    const tsFile = path.resolve(__dirname, 'src') + '/rws.ts';

    const cmdFiles = MD5Service.batchGenerateCommandFileMD5(moduleCfgDir);       

    if((!fs.existsSync(consoleClientHashFile) || await MD5Service.cliClientHasChanged(consoleClientHashFile, tsFile, cmdFiles)) || forceReload){
        if(forceReload){
            warn('[RWS] Forcing CLI client reload...');
        }
        log(color().green('[RWS]') + color().yellowBright(' Detected CLI file changes. Generating CLI client file...'));      
        
        await ProcessService.runShellCommand(`yarn webpack --config ${webpackPath}/exec/exec.webpack.config.js`, process.cwd());
        log(color().green('[RWS]') + ' CLI client file generated.')       
    }else{
        log(color().green('[RWS]') + ' CLI client file is up to date.')  
    }        
}

function generatePM2Name(filePath)
{
  return 'RWS:' + path.basename(filePath);
}


main().then(() => {
    log(color().green('[RWS]') + ' CLI command finished')
});