import { RWSHTTPRoutingEntry, WsRoutes } from '../services/ServerService';
import RWSController from '../controllers/_controller';
import RWSCommand from '../commands/_command';

import { OpModelType } from '../models/_model';

export default interface IAppConfig {   
    features?: {
        ws_enabled?: boolean
        routing_enabled?: boolean
        test_routes?: boolean
        ssl?: boolean
        auth?: boolean
        logging?: boolean
    } 
    logs_directory?: string,
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
    user_models: {[key: string]: OpModelType<any>}
    controller_list: RWSController[]
    ws_routes: WsRoutes
    http_routes: RWSHTTPRoutingEntry[] 
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