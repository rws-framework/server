import { Console } from "console";

export class BootstrapRegistry {
    private static config: any = null;
    private static initialized = false;

    static setConfig(config: any) {
        if (this.initialized) {
            throw new Error('Bootstrap configuration has already been initialized');
        }
        this.config = config;
        this.initialized = true;
    }

    static getConfig() {
        return this.config;
    }

    static isInitialized() {
        return this.initialized;
    }
}

export function RWSConfigInjector(config: any) {
    return function (target: any) {
        BootstrapRegistry.setConfig(config);
        
        // Store original main function
        const originalMain = target.prototype.main;

        // Override main function
        target.prototype.main = async function (...args: any[]) {
            console.log('RWSBootstrap: Initializing application with config...');
            
            // Call original main with stored config
            return await originalMain.apply(this, args);
        };

        return target;
    };
}