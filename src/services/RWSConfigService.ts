import IAppConfig from '../types/IAppConfig';
import { Injectable } from '../../nest';
import { ConfigService } from '@nestjs/config';

@Injectable()
class RWSConfigService<MainConfig extends IAppConfig = IAppConfig> {
    constructor(private configService: ConfigService) {};

    get<K extends keyof MainConfig>(key: K): MainConfig[K]
    {
        return this.configService.get(key as string) || null;
    }

    set<K extends keyof MainConfig>(key: K, value: MainConfig[K]): RWSConfigService<MainConfig>
    {
        this.configService.set(key as string, value);
        return this;
    }
}

export { RWSConfigService };