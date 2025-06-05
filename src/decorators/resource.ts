export interface IRWSResourceOpts {
    ws?: boolean
}

export interface IRWSResourceMeta {
    resourceName: string,
    options?: IRWSResourceOpts
}

  
export function RWSResource(resourceName: string, options?: IRWSResourceOpts) {
    const metaOpts: IRWSResourceMeta = { resourceName, options };
    return function(target: any) {     
        Reflect.defineMetadata(`RWSResource`, metaOpts, target);
    };
}