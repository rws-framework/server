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
    getList: () => {[clientId: string]: Partial<IDbUser>}
    get: (socketId: string) => Partial<IDbUser> | null
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
    private user: Partial<IDbUser>

    constructor() {
        super();
    }

    async authenticate(clientId: string, jwt_token: string | null = null, userListManager: UserListManager = _DEFAULTS_USER_LIST_MANAGER): Promise<boolean | null>
    {
        jwt_token =  jwt_token.replace('Bearer ', '');            
        const UserClass = await getConfigService().get('user_class');  

        if(!jwt_token){                
            return null;         
        }        

        if(!userListManager.get(clientId)){
            try{
                const userClass = await this.authorize<typeof UserClass>(jwt_token, UserClass);
                this.setUser(userClass);

                userListManager.set(clientId, userClass);   

                if(!userListManager.getToken(clientId)){    
                    userListManager.setToken(clientId, jwt_token);
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
    
    setUser<T extends Partial<IDbUser>>(user: T): AuthService 
    {
        this.user = user;

        return this;
    }

    getUser<T extends Partial<IDbUser>>(): T
    {
        return this.user as T;
    }

    async authorize<IUser extends { db: Model<any>, loadDbUser: () => Promise<void> }>(token: string, constructor: new (data: any) => IUser ): Promise<IUser> {
        const secretKey: string = getConfigService().get('secret_key');
            
        return await new Promise((approve, reject) => {
            jwt.verify(token, secretKey, (error, tokenData) => {
                if (error) {                        
                    reject(error);
                    return;
                }
                
                const theUser: IUser = new constructor(tokenData);
            
                if(this.getUser()){
                    approve(this.getUser() as IUser);
                    return;
                }else{
                    theUser.loadDbUser().then(() => {                    
                        ConsoleService.rwsLog('RWS AUTH LOG', ConsoleService.color().green('Loaded RWS User Model'), theUser.db.id);
                        
                        approve(theUser);
                    });
                }                            
            });
        });
    }
}

export default AuthService.getSingleton();
export { AuthService, _DEFAULTS_USER_LIST_MANAGER };