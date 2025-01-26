
import { DynamicModule } from '@nestjs/common';
import { RWSModuleType } from './IRWSModule';
import { IRWSResource } from './IRWSResource';
import { IPrefixedHTTProutes } from '../routing/routes';

export default interface IAppConfig {       
    secret_key: string
    nest_module: any
    domain?: string
    port?: number
    ws_port?: number
    mongo_url?: string
    mongo_db?: string    
    http_routes: IPrefixedHTTProutes[]
    user_model?: any
    db_models?: any[]
    ssl_cert?: string
    ssl_key?: string
    resources?: IRWSResource[]   
    front_routes?: Record<string, unknown>[]
    pub_dir?: string
    cors_domain?: string
    static_route?: string
    test_port?: number
    test_ws_port?: number
    features?: {
        ws_enabled?: boolean
        routing_enabled?: boolean
        test_routes?: boolean
        ssl?: boolean
        auth?: boolean
    } 
}