import { Injectable, Inject, Type } from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';
type Constructor<T = any> = new (...args: any[]) => T;

export function InjectServices(services: Type<any>[], staticServices: Type<any>[] = []): ClassDecorator {
    return function (target: Function) {
        const original = target;

        function getPropKey(serviceName: string){
            let propKeyArray: string[] = serviceName.split('');
            propKeyArray[0] = propKeyArray[0].toLowerCase();
            return propKeyArray.join('');
        }

        const construct = (constructor: Constructor & {[key: string]: any}, args: any[]) => {
            const c: any = function (...args: any[]) {
               
                staticServices.forEach(service => {                
                    constructor[getPropKey(service.name)] = moduleRef.get(service, { strict: false });
                });

                const instance = new constructor(...args);
                const moduleRef = args[0] as ModuleRef;

                services.forEach(service => {
                    constructor[getPropKey(service.name)] = moduleRef.get(service, { strict: false });
                });

                return instance;
            };
            c.prototype = constructor.prototype;
            return new c(...args);
        };

        const f: any = function (...args: any[]) {
            return construct(original as Constructor, args);
        };

        f.prototype = original.prototype;

        return f;
    };
}