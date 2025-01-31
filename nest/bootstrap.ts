import { serverInit } from "../src/index";
import { ServerOpts } from "../src/types/ServerTypes";
import { BootstrapRegistry } from "./decorators/RWSConfigInjector";
import { RunCallback } from '../src/types/BootstrapTypes';

export abstract class RWSBootstrap {
    private static _instance: RWSBootstrap = null;

    static async run(nestModule: any, opts: ServerOpts, callback: RunCallback | null = null): Promise<void>
    {
        if (!this._instance) {            
            this._instance = new (this as any)();
        }

        return this._instance.runServer(nestModule, opts, callback);
    }

    async runServer(nestModule: any,         
        opts: ServerOpts = { pubDirEnabled: true },
        callback: RunCallback | null = null
    ): Promise<void> {
        await serverInit(nestModule, () => BootstrapRegistry.getConfig(), opts, callback);
    }

    protected static get instance(): RWSBootstrap {
        return this._instance;
    }
}