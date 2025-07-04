
import { IRWSResource } from './IRWSResource';
import { IPrefixedHTTProutes } from '../routing/routes';
import {IDbConfigParams, OpModelType, RWSModel} from '@rws-framework/db'

export default interface IAppConfig {  
    devMode?: boolean     
    secret_key: string    
    jwt_expiration_days?: number,
    domain?: string
    port?: number
    ws_port?: number
    db_type?: IDbConfigParams['db_type']
    db_url?: string
    db_name?: string    
    db_prisma_output?: string    
    db_prisma_binary_targets?: string[]
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
    logging?: {
        loki_port: number,
        loki_url: string,
        loki_login?: string,
        loki_pass?: string,
        app_name?: string,
        environment?: string,
        log_level?: string,
        service_name?: string
    }
    features?: {
        ws_enabled?: boolean
        routing_enabled?: boolean
        test_routes?: boolean
        ssl?: boolean
        auth?: boolean,
        auth_pub_key?: string,
        auth_alghoritm?: 'RS256' | null,
        auth_passphrase?: string
        token_auth_callback?: (request: { user: RWSModel<any>},decoded: unknown) => Promise<RWSModel<any> | null>
        apikey_auth_callback?: (request: { user: RWSModel<any>}, apiKey: string) => Promise<RWSModel<any> | null>
    } 
}