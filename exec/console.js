#!/usr/bin/env node

const { rwsShell, rwsPath } = require('@rws-framework/console');
const chalk = require('chalk');
const crypto = require('crypto');
const path = require('path');
const fs = require('fs');

const params = process.argv.splice(2);
let paramsString = params.length ? (' ' + params.join(' ')) : '';
const rwsCliConfigDir = path.resolve(rwsPath.findRootWorkspacePath(), 'node_modules', '.rws', 'cli');
const getCachedPath = (key) => path.resolve(rwsCliConfigDir, key);

const commandString = `webpack --config cli.webpack.config.js --output-path ./build`;
function needsCacheWarming(){
    
    const fileList = fs.existsSync(getCachedPath('paths')) ? fs.readFileSync(getCachedPath('paths'), 'utf-8').split('\n') : [];

    if(fileList.length){
        const fileContents = [];
        for(const filePath of fileList){
            fileContents.push(fs.readFileSync(filePath, 'utf-8'));
        }
        const finalMD5 = crypto.createHash('md5').update(fileContents.join('\n')).digest('hex');
        const cachedMD5 = fs.readFileSync(getCachedPath('checksum'), 'utf-8');

        if(finalMD5 === cachedMD5){            
            return false;
        }
    }        

    return true;
}

async function main()
{
    if(needsCacheWarming() || paramsString.indexOf('--rebuild') > -1){
        console.log(chalk.yellow('[RWS CLI CACHE] Rebuilding CLI client...'));

        const cacheTypes = ['paths', 'checksum'];

        for(const type of cacheTypes){
            if(fs.existsSync(getCachedPath(type))){
                fs.unlinkSync(getCachedPath(type));
            }
        }

        await rwsShell.runCommand(commandString, process.cwd());
    }else{
        console.log(chalk.blue('[RWS CLI CACHE] Starting command from built CLI client.'));
    }    

    await rwsShell.runCommand(`node ./build/rws.cli.js${paramsString}`, process.cwd());
}

console.log(chalk.bgGreen('[RWS CLI] Starting systems...'));

main().then((data) => {
    console.log(chalk.green('[RWS CLI] Command complete.'));
}).catch((e) => {
    console.error(e.message);
});