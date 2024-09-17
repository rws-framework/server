import { Injectable } from '@rws-framework/server/nest';

import jwt from 'jsonwebtoken';

import IAuthUser from '../types/IAuthUser';
import HTTP, { ServerResponse } from 'http';
import { Error403 } from '../errors';
import IDbUser from '../types/IDbUser';
import Model from '../models/_model';
import { ConsoleService } from './ConsoleService';
import { ConfigService } from '@nestjs/config';

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

@Injectable()
class AuthService {
    private user: Partial<IDbUser>

    constructor(private configService: ConfigService, private consoleService: ConsoleService) {}

    async authenticate(clientId: string, jwt_token: string | null = null, userListManager: UserListManager = _DEFAULTS_USER_LIST_MANAGER): Promise<boolean | null>
    {
        if(jwt_token){
            jwt_token =  jwt_token.replace('Bearer ', '');            
        }

        const UserClass = await this.configService.get('user_class');  

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
                this.consoleService.error('RWS AUTH ERROR', e.message);

                return false;
            }
        }

        if(!userListManager.get(clientId)){
            userListManager.disconnectClient(clientId);    
            return false;
        }      
    }
    
    setUser<IUser extends { db: Model<any>, loadDbUser: () => Promise<void> }>(user: IUser): AuthService 
    {
        this.user = user;

        return this;
    }

    getUser<IUser extends { db: Model<any>, loadDbUser: () => Promise<void> }>(req: any = null): IUser
    {
        return this.user as IUser;
    }

    async authorize<IUser extends { db: Model<any>, loadDbUser: () => Promise<void> }>(token: string, constructor: new (data: any) => IUser ): Promise<IUser> {
        const secretKey: string = this.configService.get('secret_key');
            
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
                        this.consoleService.rwsLog('RWS AUTH LOG', this.consoleService.color().green('Loaded RWS User Model'), theUser.db.id);
                        
                        approve(theUser);
                    });
                }                            
            });
        });
    }
}

export { AuthService, _DEFAULTS_USER_LIST_MANAGER };