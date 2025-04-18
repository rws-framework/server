
import { DynamicModule } from '@nestjs/common';
import { RWSModuleType } from './IRWSModule';
import { IRWSResource } from './IRWSResource';
import { IPrefixedHTTProutes } from '../routing/routes';
import {IDbConfigParams} from '@rws-framework/db'
export default interface IAppConfig {       
    secret_key: string    
    domain?: string
    port?: number
    ws_port?: number
    db_type?: IDbConfigParams['db_type']
    db_url?: string
    db_name?: string    
    http_routes: IPrefixedHTTProutes[]
    user_model?: any
    db_models?: any[]
    ssl_cert?: string
    ssl_key?: string
    resources?: IRWSResource[]   
    front_routes?: Record<string, unknown>[]
    pub_dir?: string
    cors_domain?: string | string[]
    static_route?: string
    test_port?: number
    test_ws_port?: number
    noCoreController?: boolean
    features?: {
        ws_enabled?: boolean
        routing_enabled?: boolean
        test_routes?: boolean
        ssl?: boolean
        auth?: boolean
    } 
}