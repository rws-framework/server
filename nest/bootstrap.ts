import { serverInit } from "../src/index";
import { ServerOpts } from "../src/types/ServerTypes";
import { BootstrapRegistry } from "./decorators/RWSConfigInjector";
import { RunCallback, RunCallbackList } from '../src/types/BootstrapTypes';

export abstract class RWSBootstrap {
    private static _instance: RWSBootstrap = null;

    static async run(nestModule: any, opts: ServerOpts, callbacks: RunCallbackList | null = null): Promise<void>
    {
        if (!this._instance) {            
            this._instance = new (this as any)();
        }

        return this._instance.runServer(nestModule, opts, callbacks);
    }

    async runServer(nestModule: any,         
        opts: ServerOpts = { pubDirEnabled: true },
        callbacks: RunCallbackList | null = null
    ): Promise<void> {
        await serverInit(nestModule, () => BootstrapRegistry.getConfig(), opts, callbacks);
    }

    protected static get instance(): RWSBootstrap {
        return this._instance;
    }
}