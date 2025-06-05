import 'reflect-metadata';

export const AUTOAPI_METADATA_KEY = 'rws:autoapi:controller';

export type AutoAPIMetadata = {
    name: string;
}

export function RWSAutoApi ()
 {
    return (target: any): void => {
        Reflect.defineMetadata(AUTOAPI_METADATA_KEY, { name: target.name }, target);
    }
}