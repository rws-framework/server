#!/usr/bin/env node

const { rwsShell, rwsPath, rwsCli, } = require('@rws-framework/console');
const chalk = require('chalk');

const params = process.argv.splice(2);
let paramsString = params.length ? (' ' + params.join(' ')) : '';

const commandString = `webpack --config cli.webpack.config.js --output-path ./build`;


async function main()
{
    await rwsShell.runCommand(commandString, process.cwd());
    await rwsShell.runCommand(`node ./build/rws.cli.js${paramsString}`, process.cwd());
}

console.log(chalk.yellow('CLI init process initiating...'));

main().then((data) => {
    console.log(chalk.green('CLI init process done.'));
}).catch((e) => {
    console.error(e.message);
});