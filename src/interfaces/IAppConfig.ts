import { IHTTProute, WsRoutes, RWSController, RWSCommand } from "../index"

export default interface IAppConfig {    
    mongo_url: string
    mongo_db: string
    port: number
    domain: string
    test_port: number
    ssl_cert: string
    ssl_key: string
    secret_key: string
    user_class: any
    user_models: any[]
    controller_list: RWSController[]
    ws_routes: WsRoutes
    http_routes: IHTTProute[] 
    commands?: RWSCommand[]
    aws_lambda_region?: string
    aws_access_key?: string
    aws_secret_key?: string
    aws_lambda_role?: string
    aws_lambda_bucket?: string
    pub_dir?: string
}