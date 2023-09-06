/// <reference types="chai" />
import { IAppConfig } from '../../services/AppConfigService';
import { Server } from "socket.io";
import ServerService from "../../services/ServerService";
import { Socket } from 'socket.io-client';
import * as _mocha from 'mocha';
import { WebBrowser } from './BrowserHelper';
import TestCase from '../test_cases/_test_case';
interface ITheUser {
    [key: string]: any;
    jwt_token: string;
}
interface ITestVars {
    theUser: ITheUser | null;
    socket: Socket | null;
    server: Server | null;
    browser: WebBrowser | null;
}
type LoginCallback = (testVars: ITestVars) => Promise<any> | null;
type LoginCallbackSet = {
    before?: LoginCallback;
    beforeEach?: LoginCallback;
    afterEach?: LoginCallback;
    after?: LoginCallback;
} | null;
declare const _default: {
    connectToWS: (jwt_token: string, ping_event?: string, ping_response_event?: string) => Promise<Socket<import("@socket.io/component-emitter").DefaultEventsMap, import("@socket.io/component-emitter").DefaultEventsMap>>;
    startWS: () => Promise<ServerService>;
    createTestVars: (cfg?: IAppConfig) => ITestVars;
    disableLogging: () => void;
};
export default _default;
declare const MOCHA: typeof _mocha & {
    expect: Chai.ExpectStatic;
    setLifeCycle: (testVars: ITestVars, callbacks?: LoginCallbackSet, timeouts?: {
        before?: number;
        beforeEach?: number;
        after?: number;
    }) => void;
    setLoggedLifeCycle: (testVars: ITestVars, callbacks?: LoginCallbackSet) => void;
};
export { ITheUser, MOCHA, ITestVars, TestCase };
