import { BlackLogger, Injectable } from '../../nest';

import jwt from 'jsonwebtoken';
import * as crypto from 'crypto';
import IDbUser from '../types/IDbUser';
import { OpModelType, RWSModel } from '@rws-framework/db';
import { ConsoleService } from './ConsoleService';
import { RWSConfigService } from './RWSConfigService';

export type AuthResponse<T> = {
  success: boolean,
  user: T | null,
  token: string | null
}

export type DecodedToken = {
  sub: string,
  username: string,
  iat: number,
  exp: number
}


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

      private readonly logger = new BlackLogger(AuthService.name);
        constructor(private configService: RWSConfigService) {}

  private JWT_SECRET: string
  private JWT_EXPIRATION: number

  async onModuleInit() {
    this.JWT_SECRET = this.configService.get('secret_key');
    this.JWT_EXPIRATION = this.configService.get('jwt_expiration_days');

    this.logger.log('Auth service initialized');
  }

  async authenticate(login: string, passwd: string, userLoginKey: string = 'username', userPassKey: string = 'passwd'): Promise<AuthResponse<RWSModel<any>>>
  {
    try {
      const user: RWSModel<any> = await this.configService.get('user_model').findOneBy({
        conditions: {
          [userLoginKey]: login
        },
        fullData: true
      });

      if(!user){
        console.error('No user', login);
        return {
          success: false,
          token: null,
          user: null
        }
      }

      
      // Verify password
      const isPasswordValid = await this.verifyPassword(passwd, user[userPassKey]);

      if (!isPasswordValid) {
        console.error('Invalid password for user', login);
          return {
              success: false,
              token: null,
              user: null
          };
      }

      // Generate JWT token
      const token = this.generateToken(user);


      // Remove password from user object before sending
      const { passwd: _, ...userWithoutPassword } = user;

      return {
          success: true,
          token: token,
          user: userWithoutPassword as RWSModel<any>
      };
    }
    catch(error: Error | any){
      console.error('Authentication error:', error);
      return {
          success: false,
          token: null,
          user: null
      };
    }
  }

  async hashPassword(password: string): Promise<string> {
    const salt = this.JWT_SECRET;
    // Hash the password with the salt using SHA256
    const hash = crypto.createHash('sha256')
      .update(password + salt)
      .digest('hex');
    // Combine salt and hash with a separator
    return `${salt}:${hash}`;
  }

  // Helper method to verify passwords
  private async verifyPassword(plainPassword: string, storedHash: string): Promise<boolean> {
    try {      
      const computedHash = await this.hashPassword(plainPassword);
      return computedHash === storedHash;
    } catch (error: Error | any) {
      this.logger.error('Password verification failed:', error);
      return false;
    }
  }

  // Generate JWT token
   generateToken(user: RWSModel<any>, userLoginKey: string = 'username'): string {
    const expirationInSeconds = this.JWT_EXPIRATION * 24 * 60 * 60;
    try {    
      return jwt.sign(
        {
          sub: user.id,
          username: user[userLoginKey]
        },
        this.JWT_SECRET,
        {
          expiresIn: expirationInSeconds
        }
      );
    } catch (e: Error | any){
      throw new Error(`[AuthService] ERROR: generateToken - ${e.message}`);
    }
  }

  // Verify JWT token
  async verifyToken(token: string): Promise<any> {
    try {
      return jwt.verify(token, this.JWT_SECRET);
    } catch (error: Error | any) {
      this.logger.error('Token verification failed:', error);
      return null;
    }
  }

  async decodeToken(token: string): Promise<DecodedToken | null> {
    try {
      // Verify and decode the token
      const decoded = await this.verifyToken(token);
      if (!decoded) {
        return null;
      }

      return decoded as DecodedToken;
    } catch (error: Error | any) {
      this.logger.error('Token decoding failed:', error);
      return null;
    }
  }

  // Get user data from token
  async getUserFromToken(token: string, userPassKey: string = 'passwd'): Promise<RWSModel<any> | null> {
    try {
      const decoded = await this.decodeToken(token);
      if (!decoded) {
        return null;
      }

      // Find user by id from decoded token
      const user = await this.configService.get('user_model').findOneBy({
        conditions: {
          id: decoded.sub
        },
        fullData: true
      });

      if (!user) {
        return null;
      }

      user[userPassKey] = null;
      
      return user;

    } catch (error: Error | any) {
      this.logger.error('Failed to get user from token:', error);
      return null;
    }
  }
}

export { AuthService, _DEFAULTS_USER_LIST_MANAGER };