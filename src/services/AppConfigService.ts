import { Injectable, Module } from '@rws-framework/server/nest';
import IAppConfig from '../types/IAppConfig';
import { Error500 } from '../errors';
import { IRWSModule, RWSModuleType } from '../types/IRWSModule';

const AppDefaultConfig: IAppConfig = {
    mongo_url: null,
    mongo_db: null,
    port: null,        
    ws_port: null,        
    test_port: null,
    test_ws_port: null,
    domain: null,
    ssl_cert: null,
    ssl_key: null,
    secret_key: null,
    user_class: null,
    user_models: [],
    modules: [],
    ws_routes: {},
    http_routes: [],
    commands: [],
    aws_lambda_region: null,
    aws_access_key: null,
    aws_secret_key: null,
    aws_lambda_role: null,
    aws_lambda_bucket: null,
    pub_dir: null
};

@Injectable()
class AppConfigService {   
    private _custom_data: {
    [key: string]: any
  } = {};
  
    private data: IAppConfig; // Add type assertion here  
    private _initialized = false;
    
    init(cfg: IAppConfig): AppConfigService 
    {
        this.data = cfg;

        this._initialized = true;
        return this;
    }

    private _checkInit(){
        if(!this._initialized){
            throw new Error500(new Error("AppConfigService was not initialized. Tun .init(cfg) on the service instance."));
        }
    }
    
    getData(): IAppConfig
    {
        this._checkInit();

        return this.data;
    }

    public get(key: keyof IAppConfig | string): any
    {     
        this._checkInit();

        if(key in this.data && this.data[key as keyof IAppConfig] !== null){
            return this.data[key as keyof IAppConfig];
        }
    
        if(key in this._custom_data){
            return this._custom_data[key];
        }

        return null;
    }

    public set(key: string, val: any): void
    {
        this._custom_data[key] = val;
    }

    public reloadConfig(cfgString: string): AppConfigService 
    {        
        const cfg: () => IAppConfig = (require(cfgString)).defaults; 
        this.data = cfg();

        return this;
    }

    getModules(): RWSModuleType[] 
    {
        return this.data['modules'];
    }
}

@Module({
    providers: [AppConfigService],
    exports: [AppConfigService],
})
export class AppConfigModule {}

export { IAppConfig, AppConfigService, AppDefaultConfig };