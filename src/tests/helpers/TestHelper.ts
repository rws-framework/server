import getConfig, { IAppConfig } from '../../services/AppConfigService';
import fs from 'fs';
import path from 'path';
import ServerService, { ServerControlSet } from '../../services/ServerService';
import { io, Socket } from 'socket.io-client';

import * as _mocha from 'mocha';
import chai, { expect } from 'chai';
import chaiLike from 'chai-like';
import chaiThings from 'chai-things';

import {WebBrowser} from './BrowserHelper';

import TestCase from '../test_cases/_test_case';
import UtilsService from '../../services/UtilsService';
import { json } from 'body-parser';
import { rwsPath } from '@rws-framework/console';


chai.use(chaiLike);
chai.use(chaiThings);

interface ITheUser {
    [key: string]: any,
    jwt_token: string,
}

interface ITestVars {
    theUser: ITheUser | null,
    socket: Socket | null,
    server: ServerControlSet | null,
    browser: WebBrowser | null
}

const createTestVars = (cfg: IAppConfig = null): ITestVars => { 
    getConfig(cfg);
    return {
        server: null,
        socket: null,
        theUser: null,
        browser: null
    };
};
  
const connectToWS = async (jwt_token: string, ping_event: string = '__PING__', ping_response_event: string = '__PONG__'): Promise<Socket> => {
    const headers = {
        Authorization: 'Bearer ' + jwt_token
    };

    try {            
        process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';


        const _TESTPORT = await getConfig().get('test_port');

        const socket: Socket = io(`https://localhost:${_TESTPORT}`, {      
            extraHeaders: headers,
            rejectUnauthorized: false
        });            

        socket.on('error', (error) => {
            console.error('Socket Error:', error);
        });
        
        socket.on('connect_error', (error) => {
            console.error('Connection error:', error);
        });            

        return new Promise((done) => {
            socket.on(ping_response_event, () => {                    
                done(socket);
            });    

            socket.emit(ping_event);
        });        
    } catch (error: any) {
        console.error('Error initializing socket:', error.context.responseText);
        throw error;
    }                  
};

type LoginCallback = (testVars: ITestVars) => Promise<any> | null;
type LoginCallbackSet = { before?: LoginCallback, beforeEach?: LoginCallback, afterEach?: LoginCallback, after?: LoginCallback } | null;

const setLoggedLifeCycle = (testVars: ITestVars, callbacks?: LoginCallbackSet) => {
    setLifeCycle(testVars, {
        before: async () => {
            testVars.server = await startServer();

            if(callbacks?.after){
                return await callbacks.after(testVars);
            }

            return;
        },
        beforeEach: async () => {            
            if(callbacks?.beforeEach){
                return await callbacks.beforeEach(testVars);
            }

            return;
        },
        afterEach: async () => {
            if (testVars.socket && testVars.socket.connected) {
                testVars.socket.disconnect();
            }

            return;
        },
        after: async () => {            
            if(testVars.server){
                testVars.server.http.instance.close();
                testVars.server.websocket.instance.close();
            }  
            
            if(callbacks?.after){
                return await callbacks.after(testVars);                
            }

            return;
        }
    }, {
        beforeEach: 30000
    });
};  

const startServer = async (): Promise<ServerControlSet> => {
    const _TESTPORT = await getConfig().get('test_port');
    const _TESTWSPORT = await getConfig().get('test_ws_port');

    const server = await ServerService.initializeApp<any>({        
        controllerList: await getConfig().get('controller_list'),
        wsRoutes: await getConfig().get('ws_routes'),
        httpRoutes: await getConfig().get('http_routes'),
        port_http: _TESTPORT,
        port_ws: _TESTWSPORT
    });
    
    return server;
};

const setLifeCycle = (testVars: ITestVars, callbacks?: LoginCallbackSet, timeouts?: { before?: number, beforeEach?: number, after?: number }): void => {
    MOCHA.before(async function() {
        if(timeouts?.before){
            this.timeout(timeouts.before);        
        }            

        if(callbacks?.before){
            await callbacks.before(testVars);        
        }
    });

    MOCHA.beforeEach(async function() {
        if(timeouts?.beforeEach){
            this.timeout(timeouts.beforeEach);        
        }         
        
        if(callbacks?.beforeEach){
            await callbacks.beforeEach(testVars);        
        }

        return;
    });

    MOCHA.afterEach(async function () {   
        if(callbacks?.afterEach){
            await callbacks.afterEach(testVars);        
        }
    });
    
    MOCHA.after(async function () {   
        if(callbacks?.after){
            await callbacks.after(testVars);        
        }
    });
};

const swapCfgFile = (cfgPath: string, content: object, revert: boolean = false): void => {
    const rwsCfgDir = path.resolve(rwsPath.findRootWorkspacePath(process.cwd()),'node_modules','.rws');

    if(rwsCfgDir){
       
    }

    if(revert){
        fs.unlinkSync(cfgPath);
        fs.copyFileSync(`${rwsCfgDir}/_test_tmp_cfg_bck`, cfgPath);     
        
        return;
    }


    fs.copyFileSync(cfgPath, `${rwsCfgDir}/_test_tmp_cfg_bck`);
    fs.unlinkSync(cfgPath);
    fs.writeFileSync(cfgPath, JSON.stringify(content, null, 2));
    return;    
}

const strToJson = <T extends Object>(str: string): T => {
    return JSON.parse(str) as T;
}

console.log('IMPORTED CALLBACK');


(String.prototype as any).toJson = strToJson;

export default {  
    strToJson,
    swapCfgFile,  
    connectToWS,    
    startServer,    
    createTestVars,
    disableLogging: () => { console.log = () => {}; }
};

const MOCHA = Object.assign(_mocha, {
    expect,
    setLifeCycle,    
    setLoggedLifeCycle
});

export {
    ITheUser, MOCHA, ITestVars, TestCase
};