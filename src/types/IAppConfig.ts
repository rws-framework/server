
import { DynamicModule } from '@nestjs/common';
import { RWSModuleType } from './IRWSModule';
import { IRWSResource } from './IRWSResource';
import { IPrefixedHTTProutes } from '../routing/routes';
import { OpModelType } from '@rws-framework/db';

export default interface IAppConfig {       
    secret_key: string    
    domain?: string
    port?: number
    ws_port?: number
    mongo_url?: string
    mongo_db?: string    
    http_routes: IPrefixedHTTProutes[]
    user_model?: OpModelType<any>
    db_models?: OpModelType<any>[]
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
        auth?: boolean,
        auth_pub_key?: string,
        auth_alghoritm?: 'RS256' | null,
        auth_passphrase?: string
    } 
}