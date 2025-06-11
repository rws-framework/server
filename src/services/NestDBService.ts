import { Injectable } from '../../nest';
import { RWSConfigService } from './RWSConfigService';
import { DBService, IDbConfigHandler } from '@rws-framework/db';

@Injectable()
export class NestDBService {
    private proxyHandler: ProxyHandler<NestDBService>;
    private proxy: NestDBService;
    private db: DBService;

    core(): DBService
    {
        return this.db;
    }

    constructor(private configService: RWSConfigService) {
        this.db = new DBService(this.configService);
        
        this.proxyHandler = {
            get: (target: NestDBService, prop: string | symbol, receiver: any) => {                
                if (prop in target) {
                    return Reflect.get(target, prop, receiver);
                }
                                
                if (prop in target.db) {
                    const dbProperty = Reflect.get(target.db, prop);
                                        
                    if (typeof dbProperty === 'function') {
                        return dbProperty.bind(target.db);
                    }
                    
                    return dbProperty;
                }
                                
                return undefined;
            }
        };
        
        this.proxy = new Proxy(this, this.proxyHandler);
                
        return this.proxy;
    }
}