#!/usr/bin/env node

const path = require('path');
const fs = require('fs');

let forceReload = false;

for(let arg_key in process.argv){
    if(process.argv[arg_key].indexOf('--reload') > -1){
        forceReload = true;
        process.argv[arg_key] = process.argv[arg_key].replace('--reload', '');
    }   
}

const command2map = process.argv[2];
let args = process.argv[3] || '';
const { spawn, exec } = require('child_process');
const crypto = require('crypto');
const ProcessService = require('../dist/src/services/ProcessService').default;
const ConsoleService = require('../dist/src/services/ConsoleService').default;
const MD5Service = require('../dist/src/services/MD5Service').default;
const UtilsService = require('../dist/src/services/UtilsService').default;

const { filterNonEmpty } = UtilsService;
const { log, warn, error, color } = ConsoleService;



const pm2 = require('pm2');


const os = require('os');

const totalMemoryBytes = os.totalmem();
const totalMemoryKB = totalMemoryBytes / 1024;
const totalMemoryMB = totalMemoryKB / 1024;
const totalMemoryGB = totalMemoryMB / 1024;

const moduleCfgDir = `${path.resolve(process.cwd())}/node_modules/.rws`;
    const cfgPathFile = `${moduleCfgDir}/_cfg_path`;  

    const webpackPath = path.resolve(__dirname, '..');

const main = async () => {    
    if(fs.existsSync(cfgPathFile)){
        process.env.WEBPACK_CFG_FILE = fs.readFileSync(cfgPathFile, 'utf-8');
    }else{
        process.env.WEBPACK_CFG_FILE = args?.config;    
    }

    if(!fs.existsSync(`${process.cwd()}/node_modules/ts-loader`)){
        log(color().green('[RWS]')+' installing ts-loader for inner RWS CLI ops') 
        await ProcessService.runShellCommand(`cd ${process.cwd()} && npm install ts-loader`);    
        log('[RWS Console] install done')
    }

    
    await generateCliClient();    

    log(`${color().green('[RWS]')} generated CLI client executing ${command2map} command`);

    try {
        await ProcessService.PM2ExecCommand(`${webpackPath}/exec/dist/rws.js`, { args: [command2map, ...filterNonEmpty(args.split(' '))] });
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
        log(color().green('[RWS]') + ' generating CLI client file...')      
        await ProcessService.PM2ExecCommand(`npx webpack --config ${webpackPath}/exec/exec.webpack.config.js`);
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