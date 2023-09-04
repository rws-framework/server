import { ConsoleService, IAppConfig, SetupRWS } from '@rws-js/server';
const { log, warn, error, color } = ConsoleService;
import path from 'path';
import fs from 'fs';

const initAction = async (frameworkConfig: IAppConfig) => {     

    ConsoleService.log(color().green('[RWS]') + ' starting systems...');              
    
    try {                              
        await SetupRWS(frameworkConfig);
        const prismaCfgPath = path.resolve(__dirname, '..', '..', 'prisma') + '/schema.prisma';        
        fs.unlinkSync(prismaCfgPath);
        ConsoleService.log(color().green('[RWS]') + ' systems initialized.'); 
    } catch (error) {
        ConsoleService.error('Error while initiating RWS server installation:', error);
    }                        
                
    return;
}

export default initAction;