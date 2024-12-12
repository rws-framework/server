import { serverInit } from "../src/index";
import { ServerOpts } from "../src/types/ServerTypes";
import { BootstrapRegistry } from "./decorators/RWSConfigInjector";


export abstract class RWSBootstrap {
    private static _instance: RWSBootstrap = null;

    static async run(nestModule: any, opts: ServerOpts): Promise<void>
    {
        if (!this._instance) {            
            this._instance = new (this as any)();
        }

        return this._instance.runServer(nestModule, opts);
    }

    async runServer(nestModule: any,         
        opts: ServerOpts = {}
    ): Promise<void> {
        await serverInit(nestModule, () => BootstrapRegistry.getConfig(), opts);
    }

    protected static get instance(): RWSBootstrap {
        return this._instance;
    }
}