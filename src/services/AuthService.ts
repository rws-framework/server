import getConfigService from './AppConfigService';
import ConsoleService from './ConsoleService';
import jwt from 'jsonwebtoken';
import TheService from './_service';
import IAuthUser from '../interfaces/IAuthUser';
import HTTP, { ServerResponse } from 'http';
import { Error403 } from '../errors';
import IDbUser from '../interfaces/IDbUser';
import Model from '../models/_model';
import { Socket } from 'socket.io';
import { IAuthUserTokenManager } from '../interfaces/IAuthUserTokenManager';
import { JWTUsers } from '../interfaces/ServerTypes';
type UserListManager = {
    getList: () => {[clientId: string]: IDbUser}
    get: (userId: string) => IDbUser | null
    set: (val: IDbUser) => void
    getToken: (userId: string) => string | null
    setToken: (userId: string, val: string) => void
    getTokenList: () => {[userId: string]: string;}
    disconnectClient: (userId: string) => void
}


const _DEFAULTS_USER_LIST_MANAGER = {
    getList: () => { return {} },
    get: (userId: string): IDbUser | null => null,
    set: (val: IDbUser) => {},
    getToken: (userId: string): string | null => null,
    setToken: (userId: string, val: string) => {},
    getTokenList: () => { return {} },
    disconnectClient: (userId: string) => {}
}

/**
 * @notExported
 */
class AuthService extends TheService{
    private user: Partial<IDbUser>

    constructor() {
        super();
    }

    getUser<UserType extends IDbUser>(userList : JWTUsers, userId: string): UserType | null
    {
        return !!userList[userId] ? (userList[userId] as UserType) : null
    }

    async authenticate(jwt_token: string | null = null, userListManager: UserListManager = _DEFAULTS_USER_LIST_MANAGER): Promise<boolean | null>
    {
        if(jwt_token){
            jwt_token =  jwt_token.replace('Bearer ', '');            
        }

        const UserClass = await getConfigService().get('user_class');  

        if(!jwt_token){                
            return null;         
        }        
        
        const parsedUser: IDbUser = await this.authorize<typeof UserClass>(jwt_token, UserClass);

        if(!userListManager.get(parsedUser.mongoId)){
            try{                                

                userListManager.set(parsedUser);   

                if(!userListManager.getToken(parsedUser.mongoId)){
                    userListManager.setToken(parsedUser.mongoId, jwt_token);
                }
                
                return true;
            } catch(e: Error | any){
                ConsoleService.error('RWS AUTH ERROR', e.message);

                return false;
            }
        }

        if(!userListManager.get(parsedUser.mongoId)){
            userListManager.disconnectClient(parsedUser.mongoId);    
            return false;
        }      
    }  

    async authorize<IUser extends IAuthUserTokenManager>(token: string, constructor: new (data: any) => IUser ): Promise<IUser> {
        const secretKey: string = getConfigService().get('secret_key');
            
        return await new Promise((approve: (user: IUser) => void, reject) => {
            jwt.verify(token, secretKey, (error, tokenData) => {
                if (error) {                        
                    reject(error);
                    return;
                }
                
                const theUser: IUser = new constructor(tokenData);

            
                theUser.loadDbUser().then((userModel: Model<any>) => {                                            
                    ConsoleService.log('RWS AUTH LOG', ConsoleService.color().green('Loaded RWS User Model'), userModel.id);
                    
                    approve(theUser);
                }).catch((e: Error | unknown) => {
                    reject(e);
                });                    
            });
        });
    }
}

export default AuthService.getSingleton();
export { AuthService, _DEFAULTS_USER_LIST_MANAGER };