import axios, { AxiosInstance, CreateAxiosDefaults } from 'axios';
import https from 'https';

import getAppConfig from '../../services/AppConfigService';

export default {
    createInstance: (opts: CreateAxiosDefaults): AxiosInstance => {
        const axiosInstance = axios.create(Object.assign({
            headers: {
                'Content-Type': 'application/json',
                'Origin': getAppConfig().get('domain')
            },
            withCredentials: true,
            httpsAgent: new https.Agent({  
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