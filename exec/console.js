#!/usr/bin/env node

const rwsConsole = require('@rws-framework/console');

const path = require('path');
const rwsError = console.error;
const log = console.log;

const bootstrap = rwsConsole.rwsCli.bootstrap(['proxy'], __dirname + '/actions');

(async () => {
    await bootstrap.run({
        proxy: true,
        options: [{
            short: 'r',
            long: 'reload'
        }]        
    });
})()