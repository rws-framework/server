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

const _tools = require('../_tools');

let ConsoleService = null;
let MD5Service = null;

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

let packageRootDir = null;

let moduleCfgDir = null;
let cfgPathFile = null;

const main = async () => {    
    if(fs.existsSync(cfgPathFile)){
        process.env.WEBPACK_CFG_FILE = fs.readFileSync(cfgPathFile, 'utf-8');
    }else{
        process.env.WEBPACK_CFG_FILE = args?.config || 'config/config';    
    }    

    await setVendors();    
    await generateCliClient();        

    log(`${color().green('[RWS]')} generated CLI client executing ${command2map} command`, `${webpackPath}/exec/dist/rws.js ${command2map} ${args}`);  

    try {
        await _tools.runCommand(`node ./build/rws.cli.js ${command2map} ${args}`, process.cwd());
    } catch(err) {
        rwsError(err);
    }

    return;
}

const setVendors = async () => {    
    if(forceReload){
        console.warn('[RWS] Forcing CLI vendors reload...');

        _tools.removeDirectory(`${__dirname}/vendors`);
        // _tools.removeDirectory(`${__dirname}/node_modules`);
        // await _tools.removeDirectory(`${__dirname}/src/_root`);
    }

    if(!fs.existsSync(path.resolve(__dirname, 'vendors'))){
        packageRootDir = _tools.findRootWorkspacePath(process.cwd());
        console.log('[RWS CLI vendors] Generating vendors for CLI usage...');
        
        const symLinkPath = path.resolve(__dirname, 'dist','node_modules');
        const symLinkPathExec = path.resolve(__dirname, 'node_modules');

        if(fs.existsSync(symLinkPath)){
            _tools.removeDirectory(symLinkPath);
        }   
        
        if(fs.existsSync(symLinkPathExec)){
            _tools.removeDirectory(symLinkPathExec);
        } 

        // _tools.createAndLogSymlink(path.resolve(packageRootDir, 'node_modules'), symLinkPath);
        // _tools.createAndLogSymlink(path.resolve(packageRootDir, 'node_modules'), symLinkPathExec);

        await _tools.runCommand(`${packageRootDir}/node_modules/.bin/tsc`, __dirname);        

        const configPath = args?.config || 'config/config';
        
        const webpackCmd = `${packageRootDir}/node_modules/.bin/webpack`;

        // if(fs.existsSync(__dirname + '/dist/package.json')){
        //     fs.unlinkSync(__dirname + '/dist/package.json');
        // }

        // fs.writeFileSync( __dirname + '/dist/package.json', '{"name": "rws-js-server-cfg", "version": "1.0.0" }');

        // await _tools.runCommand(`${webpackCmd} --config ${__dirname}/exec.webpack.config.js`, process.cwd());             

        console.log('[RWS CLI vendors] Done.');
    }
    
    ConsoleService = require('./vendors/rws/services/ConsoleService').default;
    MD5Service = require('./vendors/rws/services/MD5Service').default;    
}

async function generateCliClient()
{        
    packageRootDir = _tools.findRootWorkspacePath(process.cwd());    

    moduleCfgDir = `${packageRootDir}/node_modules/.rws`;
    cfgPathFile = `${moduleCfgDir}/_cfg_path`;      

    const webpackCmd = `${packageRootDir}/node_modules/.bin/webpack`;

    log = ConsoleService.log;
    warn = ConsoleService.warn;
    rwsError = ConsoleService.error;
    color = ConsoleService.color;

    const consoleClientHashFile = `${moduleCfgDir}/_cli_hash`;       

    if(!fs.existsSync(moduleCfgDir)){
        fs.mkdirSync(moduleCfgDir);
    }

    const tsFile = path.resolve(webpackPath, 'exec','src') + '/rws.ts';

    console.log('!!!!!!!!!!!!',tsFile)

    const cmdFiles = MD5Service.batchGenerateCommandFileMD5(moduleCfgDir);  


    if((!fs.existsSync(consoleClientHashFile) || await MD5Service.cliClientHasChanged(consoleClientHashFile, tsFile, cmdFiles)) || forceReload){
        if(forceReload){
            warn('[RWS] Forcing CLI client reload...');
        }

        log(color().green('[RWS]') + color().yellowBright(' Detected CLI file changes. Generating CLI client file...'));      
        
        await _tools.runCommand(`${webpackCmd} --config ${webpackPath}/exec/exec.webpack.config.js`, process.cwd());
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
    log = ConsoleService.log;
    color = ConsoleService.color;

    log(color().green('[RWS]') + ' CLI command finished')
});