import RWSCommand from '../commands/_command';
import { RWSModuleType } from './IRWSModule';

export default interface IAppConfig {   
    features?: {
        ws_enabled?: boolean
        routing_enabled?: boolean
        test_routes?: boolean
        ssl?: boolean
        auth?: boolean
    } 
    mongo_url: string
    mongo_db: string
    port: number
    ws_port?: number
    domain: string
    test_port?: number
    test_ws_port?: number
    ssl_cert: string
    ssl_key: string
    secret_key: string
    user_class: any
    user_models: any[]
    modules: RWSModuleType[],
    ws_routes: any
    http_routes: any
    front_routes?: Record<string, unknown>[],
    commands?: RWSCommand[]
    aws_lambda_region?: string
    aws_access_key?: string
    aws_secret_key?: string
    aws_lambda_role?: string
    aws_lambda_bucket?: string
    pub_dir?: string
    cors_domain?: string
}