#!/usr/bin/env node

const path = require('path');
const chalk = require('chalk');
const fs = require('fs');
const { rwsShell, rwsPath } = require('@rws-framework/console');
let forceReload = false;

const runCommand = rwsShell.runCommand;
const findRootWorkspacePath = rwsPath.findRootWorkspacePath;
const findPackagePath = rwsPath.findPackageDir;
const removeDirectory = rwsPath.removeDirectory;


let ConsoleService = null;
let MD5Service = null;

const packageRootDir = findRootWorkspacePath(process.cwd());
const webpackPath = findPackagePath(__dirname);
const nodeModulesDir = path.resolve(packageRootDir, 'node_modules');
const moduleCfgDir = `${nodeModulesDir}/.rws`;

const cfgPathFile = `${moduleCfgDir}/_cfg_path`;   

module.exports = async (output) => {
    const program = output.program;
    const commandOptions = output.options;    
    const command2map = output.command;
    const args = output.rawArgs || []; 
        

    const lineArgs = process.argv.splice(3).filter((item) => !(item.indexOf('-') > -1 || item.indexOf('--') > -1));    

    const cfgConfigArg = args[0];

    if(commandOptions.reload || command2map === 'init' || command2map === 'db:schema:reload'){
        forceReload = true;
    }

    if(fs.existsSync(cfgPathFile)){
        process.env.WEBPACK_CFG_FILE = fs.readFileSync(cfgPathFile, 'utf-8');
    }else{
        process.env.WEBPACK_CFG_FILE = cfgConfigArg || 'config/config';    
    }

    await setVendors();    
    await generateCliClient();           

    log(`${color().green('[RWS]')} generated CLI client executing ${ConsoleService.color().blue(command2map)} command with params: ${lineArgs ? lineArgs : '""'}`);  

    // const relpath = path.relative(__dirname, 'dist',)

    try {
        await runCommand(`node ${path.resolve(webpackPath, 'exec/dist/vendors/build/cli')}/rws.cli.js ${command2map} ${lineArgs}`, process.cwd());
    } catch(err) {
        rwsError(err);
    }

    return;
}

const setVendors = async () => {    
    const distDir = path.resolve(webpackPath, 'exec', 'dist');
    const vendorsDir = path.resolve(distDir, 'vendors');

    if(!fs.existsSync(distDir)){
        fs.mkdirSync(distDir);
    }

    if(forceReload){
        console.log(chalk.green('[RWS CLI vendors]'), chalk.yellow('Forcing CLI vendors reload...'));

        if(fs.existsSync(path.join(vendorsDir, '/src'))){
            removeDirectory(vendorsDir);  
        }  
    }

    if(!fs.existsSync(path.join(vendorsDir, '/src'))){
        console.log(chalk.green('[RWS CLI vendors]'), chalk.yellow('Generating vendors for CLI usage...'));        

        await runCommand(`yarn build:cli`, webpackPath);      

        console.log(chalk.green('[RWS  CLI vendors]'), chalk.green('CLI vendors reload complete.'));
    }
    
    ConsoleService = require(`${webpackPath}/exec/dist/vendors/src/services/ConsoleService`).default;
    MD5Service = require(`${webpackPath}/exec/dist/vendors/src/services/MD5Service`).default;    
}

const consoleClientHashFile = `${moduleCfgDir}/_cli_hash`;

const shouldReload = async (tsFile) => 
    (!fs.existsSync(consoleClientHashFile) 
    || await MD5Service.cliClientHasChanged(consoleClientHashFile, tsFile)) 
    || forceReload
;

async function generateCliClient(command, args)
{               
    const webpackCmd = `${nodeModulesDir}/.bin/webpack`;

    log = ConsoleService.log;
    warn = ConsoleService.warn;
    rwsError = ConsoleService.error;
    color = ConsoleService.color;        

    if(!fs.existsSync(moduleCfgDir)){
        fs.mkdirSync(moduleCfgDir);
    }    

    const tsFile = path.resolve(webpackPath, 'exec','src') + '/rws.ts';    

    if(await shouldReload(tsFile)){
        if(forceReload){
            warn('[RWS] Forcing CLI client reload...');
        }

        log(color().green('[RWS]') + color().yellowBright(' Detected CLI file changes. Generating CLI client file...'));      
        
        await runCommand(`${webpackCmd} --config ${webpackPath}/exec/exec.webpack.config.js`, process.cwd());
        log(color().green('[RWS]') + ' CLI client file generated.')       
    }else{
        log(color().green('[RWS]') + ' CLI client file is up to date.')  
    }        
}

function generatePM2Name(filePath)
{
  return 'RWS:' + path.basename(filePath);
}