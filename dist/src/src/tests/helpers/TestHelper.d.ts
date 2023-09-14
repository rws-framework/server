import { IAppConfig } from '../../services/AppConfigService';
import { Server } from "socket.io";
import ServerService from "../../services/ServerService";
import { Socket } from 'socket.io-client';
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
declare const _default: {
    connectToWS: (jwt_token: string, ping_event?: string, ping_response_event?: string) => Promise<Socket>;
    startWS: () => Promise<ServerService>;
    createTestVars: (cfg?: IAppConfig) => ITestVars;
    disableLogging: () => void;
};
export default _default;
declare const MOCHA: any;
export { ITheUser, MOCHA, ITestVars, TestCase };
