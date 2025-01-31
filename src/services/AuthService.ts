import { Injectable } from '../../nest';

import jwt from 'jsonwebtoken';

import IDbUser from '../types/IDbUser';
import { OpModelType } from '@rws-framework/db';
import { ConsoleService } from './ConsoleService';
import { RWSConfigService } from './RWSConfigService';

type UserListManager = {
    getList: () => {[clientId: string]: Partial<IDbUser>}
    get: (socketId: string) => Partial<IDbUser> | null
    set: (socketId: string, val: IDbUser) => void
    getToken: (socketId: string) => string | null
    setToken: (socketId: string, val: string) => void
    getTokenList: () => {[socketId: string]: string;}
    disconnectClient: (socketId: string) => void
}

const _DEFAULTS_USER_LIST_MANAGER = {
    getList: () => { return {} },
    get: (socketId: string): IDbUser | null => null,
    set: (socketId: string, val: IDbUser) => {},
    getToken: (socketId: string): string | null => null,
    setToken: (socketId: string, val: string) => {},
    getTokenList: () => { return {} },
    disconnectClient: (socketId: string) => {}
}

@Injectable()
class AuthService {
    private user: IDbUser;

    constructor(private configService: RWSConfigService, private consoleService: ConsoleService) {}

    async authenticate(clientId: string, jwt_token: string | null = null, userListManager: UserListManager = _DEFAULTS_USER_LIST_MANAGER): Promise<boolean | null>
    {
        if(jwt_token){
            jwt_token =  jwt_token.replace('Bearer ', '');            
        }

        const UserClass: OpModelType<unknown> = await this.configService.get('user_model');  

        if(!jwt_token){                
            return null;         
        }        

        if(!userListManager.get(clientId)){
            try{
                const userClass = await this.authorize<any>(jwt_token, UserClass);
                this.setUser(userClass);

                userListManager.set(clientId, userClass);

                if(!userListManager.getToken(clientId)){    
                    userListManager.setToken(clientId, jwt_token);
                }
                
                return true;
            } catch(e: Error | any){
                this.consoleService.error('RWS AUTH ERROR', e.message);

                return false;
            }
        }

        if(!userListManager.get(clientId)){
            userListManager.disconnectClient(clientId);    
            return false;
        }      
    }
    
    setUser(user: IDbUser): AuthService 
    {
        this.user = user;

        return this;
    }

    getUser(): IDbUser
    {
        return this.user;
    }

    async authorize<T extends IDbUser>(token: string, constructor: new (data: any) => T ): Promise<IDbUser> {
        const secretKey: string = this.configService.get('secret_key');
            
        return await new Promise( (approve, reject) => {
            jwt.verify(token, secretKey, async (error, tokenData) => {
                if (error) {                        
                    reject(error);
                    return;
                }                            
            
                if(!this.getUser()){
                    const theUser: IDbUser = await (constructor as OpModelType<any>).find((tokenData as IDbUser).id);                
                    this.setUser(theUser);
                }   
                
                approve(this.getUser());
            });
        });
    }
}

export { AuthService, _DEFAULTS_USER_LIST_MANAGER };