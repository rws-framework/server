export interface ICmdParams {
    [key: string]: any
    verbose?: boolean
    _rws_config?: IAppConfig
    _extra_args: {
        [key: string]: any
    }
}

export interface ICmdParamsReturn {
    subCmd: string;
    apiCmd: string;
    apiArg: string;
    extraParams: {
        [key: string]: any
    };
}