"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TestCase = exports.MOCHA = void 0;
const AppConfigService_1 = __importDefault(require("../../services/AppConfigService"));
const ServerService_1 = __importDefault(require("../../services/ServerService"));
const socket_io_client_1 = require("socket.io-client");
const _mocha = __importStar(require("mocha"));
const chai_1 = __importStar(require("chai"));
const chai_like_1 = __importDefault(require("chai-like"));
const chai_things_1 = __importDefault(require("chai-things"));
const _test_case_1 = __importDefault(require("../test_cases/_test_case"));
exports.TestCase = _test_case_1.default;
chai_1.default.use(chai_like_1.default);
chai_1.default.use(chai_things_1.default);
const createTestVars = (cfg = null) => {
    (0, AppConfigService_1.default)(cfg);
    return {
        server: null,
        socket: null,
        theUser: null,
        browser: null
    };
};
const connectToWS = async (jwt_token, ping_event = '__PING__', ping_response_event = '__PONG__') => {
    const headers = {
        Authorization: 'Bearer ' + jwt_token
    };
    try {
        process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
        const _TESTPORT = await (0, AppConfigService_1.default)().get('test_port');
        const socket = (0, socket_io_client_1.io)(`https://localhost:${_TESTPORT}`, {
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
    }
    catch (error) {
        console.error('Error initializing socket:', error.context.responseText);
        throw error;
    }
};
const setLoggedLifeCycle = (testVars, callbacks) => {
    setLifeCycle(testVars, {
        before: async () => {
            testVars.server = await startWS();
            if (callbacks === null || callbacks === void 0 ? void 0 : callbacks.after) {
                return await callbacks.after(testVars);
            }
            return;
        },
        beforeEach: async () => {
            if (callbacks === null || callbacks === void 0 ? void 0 : callbacks.beforeEach) {
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
            if (testVars.server) {
                testVars.server.close();
            }
            if (callbacks === null || callbacks === void 0 ? void 0 : callbacks.after) {
                return await callbacks.after(testVars);
            }
            return;
        }
    }, {
        beforeEach: 30000
    });
};
const startWS = async () => {
    const _TESTPORT = await (0, AppConfigService_1.default)().get('test_port');
    const server = await ServerService_1.default.initializeApp({
        port: _TESTPORT,
        controllerList: await (0, AppConfigService_1.default)().get('controller_list'),
        wsRoutes: await (0, AppConfigService_1.default)().get('ws_routes'),
        httpRoutes: await (0, AppConfigService_1.default)().get('http_routes')
    });
    const startListener = async () => new Promise((resolve) => {
        server.webServer().listen(_TESTPORT, () => {
            resolve();
        });
    });
    await startListener();
    return server;
};
const setLifeCycle = (testVars, callbacks, timeouts) => {
    MOCHA.before(async function () {
        if (timeouts === null || timeouts === void 0 ? void 0 : timeouts.before) {
            this.timeout(timeouts.before);
        }
        if (callbacks === null || callbacks === void 0 ? void 0 : callbacks.before) {
            await callbacks.before(testVars);
        }
    });
    MOCHA.beforeEach(async function () {
        if (timeouts === null || timeouts === void 0 ? void 0 : timeouts.beforeEach) {
            this.timeout(timeouts.beforeEach);
        }
        if (callbacks === null || callbacks === void 0 ? void 0 : callbacks.beforeEach) {
            await callbacks.beforeEach(testVars);
        }
        return;
    });
    MOCHA.afterEach(async function () {
        if (callbacks === null || callbacks === void 0 ? void 0 : callbacks.afterEach) {
            await callbacks.afterEach(testVars);
        }
    });
    MOCHA.after(async function () {
        if (callbacks === null || callbacks === void 0 ? void 0 : callbacks.after) {
            await callbacks.after(testVars);
        }
    });
};
exports.default = {
    connectToWS,
    startWS,
    createTestVars,
    disableLogging: () => { console.log = () => { }; }
};
const MOCHA = Object.assign(_mocha, {
    expect: chai_1.expect,
    setLifeCycle,
    setLoggedLifeCycle
});
exports.MOCHA = MOCHA;
//# sourceMappingURL=TestHelper.js.map