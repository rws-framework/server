import getConfigService from './AppConfigService';
import ConsoleService from './ConsoleService';
import jwt from 'jsonwebtoken';
import TheService from './_service';
import IAuthUser from '../interfaces/IAuthUser';
import HTTP, { ServerResponse } from 'http';
import { Error403 } from '../errors';
import IDbUser from '../interfaces/IDbUser';
import Model from '../models/_model';

type UserListManager = {
    getList: () => {[clientId: string]: IDbUser}
    get: (socketId: string) => IDbUser | null
    set: (socketId: string, val: IAuthUser) => void
    getToken: (socketId: string) => string | null
    setToken: (socketId: string, val: string) => void
    getTokenList: () => {[socketId: string]: string;}
    disconnectClient: (socketId: string) => void
}

const _DEFAULTS_USER_LIST_MANAGER = {
    getList: () => { return {} },
    get: (socketId: string): IDbUser | null => null,
    set: (socketId: string, val: IAuthUser) => {},
    getToken: (socketId: string): string | null => null,
    setToken: (socketId: string, val: string) => {},
    getTokenList: () => { return {} },
    disconnectClient: (socketId: string) => {}
}

/**
 * @notExported
 */
class AuthService extends TheService{
    constructor() {
        super();
    }

    async authenticate(clientId: string, request: HTTP.IncomingMessage, response: ServerResponse, userListManager: UserListManager = _DEFAULTS_USER_LIST_MANAGER): Promise<boolean | null>
    {
        const authHeader: string | null =  request.headers.authorization ? request.headers.authorization.replace('Bearer ', '') : null;            
        const UserClass = await getConfigService().get('user_class');  

        if(!authHeader){                
            return null;         
        }        

        if(!userListManager.get(clientId)){
            try{
                userListManager.set(clientId, await this.authorize<typeof UserClass>(authHeader, UserClass));   

                if(!userListManager.getToken(clientId)){    
                    userListManager.setToken(clientId, authHeader);
                }
                
                return true;
            } catch(e: Error | any){
                ConsoleService.error('RWS AUTH ERROR', e.message);

                return false;
            }
        }

        if(!userListManager.get(clientId)){
            userListManager.disconnectClient(clientId);    
            return false;
        }      
    }

    async authorize<IUser extends { userDbModel: Model<any>, loadDbUser: () => Promise<void> }>(token: string, constructor: new (data: any) => IUser ): Promise<IUser> {
        const secretKey: string = getConfigService().get('secret_key');
            
        return await new Promise((approve, reject) => {
            jwt.verify(token, secretKey, (error, tokenData) => {
                if (error) {                        
                    reject(error);
                    return;
                }
                
                const theUser: IUser = new constructor(tokenData);
            
                (theUser as any).loadDbUser().then(() => {
                    console.log('Loaded RWS User Model', theUser.userDbModel.id)
                    approve(theUser);
                });
              
            });
        });
    }
}

export default AuthService.getSingleton();
export { AuthService, _DEFAULTS_USER_LIST_MANAGER };