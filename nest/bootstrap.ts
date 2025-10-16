import { serverInit } from "../src/index";
import { ServerOpts } from "../src/types/ServerTypes";
import { BootstrapRegistry } from "./decorators/RWSConfigInjector";
import { RunCallback, RunCallbackList } from '../src/types/BootstrapTypes';
import { INestApplication } from "@nestjs/common";
import IAppConfig from "../src/types/IAppConfig";

export abstract class RWSBootstrap {
    private static _instance: RWSBootstrap = null;

    static setConfig(config: IAppConfig){
        BootstrapRegistry.setConfig(config);
    }

    static async run(nestModule: any, opts: ServerOpts, callbacks: RunCallbackList | null = null): Promise<INestApplication>
    {
        if (!this._instance) {            
            this._instance = new (this as any)();
        }

        const instance =  await this._instance.runServer(nestModule, opts, callbacks);

        return instance;
    }

    async runServer(nestModule: any,         
        opts: ServerOpts = { pubDirEnabled: true },
        callbacks: RunCallbackList | null = null
    ): Promise<INestApplication> {        
        const server = await serverInit(nestModule, () => BootstrapRegistry.getConfig(), opts, callbacks);
        server.listen();
        return server.app;
    }

    protected static get instance(): RWSBootstrap {
        return this._instance;
    }
}