"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
const https_1 = __importDefault(require("https"));
const AppConfigService_1 = __importDefault(require("../../services/AppConfigService"));
exports.default = {
    createInstance: (opts) => {
        const axiosInstance = axios_1.default.create(Object.assign({
            headers: {
                'Content-Type': 'application/json',
                'Origin': (0, AppConfigService_1.default)().get('domain')
            },
            withCredentials: true,
            httpsAgent: new https_1.default.Agent({
                rejectUnauthorized: false // This line will ignore SSL verification.
            })
        }, opts));
        axiosInstance.defaults.timeout = 60000; // Increase timeout to 60000ms (60 seconds)
        axiosInstance.interceptors.request.use((config) => {
            return config;
        });
        return axiosInstance;
    }
};
//# sourceMappingURL=AxiosHelper.js.map