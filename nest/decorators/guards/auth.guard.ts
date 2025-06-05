import { Injectable, CanActivate, ExecutionContext, UnauthorizedException, applyDecorators, UseGuards, createParamDecorator } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from './public.decorator';
import { IAppConfig, RWSConfigService } from '../../../src';
import { OpModelType } from '@rws-framework/db';
import { rwsPath } from '@rws-framework/console';
import * as jwt from 'jsonwebtoken';
import fs from 'fs';
import path from 'path';

export const RWS_PROTECTED_KEY = 'rws_protected';

@Injectable()
export class AuthGuard implements CanActivate {
  private rwsConfigFeatures: IAppConfig['features'];
  constructor(
    private configService: RWSConfigService<IAppConfig>,
    private reflector: Reflector
  ) {
    this.rwsConfigFeatures = this.configService.get('features');
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {    
    console.log('AuthGuard.canActivate called');  // Add this debug line

     const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    
    const isRWSProtected = this.reflector.getAllAndOverride<boolean>(RWS_PROTECTED_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);    

    const request = context.switchToHttp().getRequest();

    if (isPublic || isRWSProtected === false || !this.rwsConfigFeatures?.auth) {
      return true;
    }

    const UserModel = this.configService.get('user_model');

    if(!UserModel){
      throw new Error('No user_model in RWS backend config');
    }

    const {token, type} = this.extractTokenFromHeader(request);

    if (!token) {
      throw new UnauthorizedException();
    }

    try {
      let user;
      
      const features =  this.configService.get('features');

      if(!features){
        throw new Error('App lacks setup in "features" section');
      }

      const featuresAuth =  features.auth;
      
      if(!featuresAuth){
        throw new Error('App "features.auth" config is disabled');
      }

      if (type === 'Bearer') {
        const isRS256 = this.rwsConfigFeatures.auth_alghoritm === 'RS256';
        const secret = isRS256 ? fs.readFileSync(path.join(rwsPath.findRootWorkspacePath(), this.rwsConfigFeatures.auth_pub_key), 'utf-8') : this.configService.get('secret_key');
        const decoded = jwt.verify(token, secret, isRS256 ? {
          algorithms: ['RS256']
        }: undefined);        
        

        if(!features.token_auth_callback){
          throw new Error('App needs "features.token_auth_callback" defined');
        }

        // Find user based on decoded token data
        user = await features.token_auth_callback(decoded);
      } else if (type === 'ApiKey') {
        if(!features.apikey_auth_callback){
          throw new Error('App needs "features.apikey_auth_callback" defined');
        }

        user = await features.apikey_auth_callback(token);
      }

      if (!user) {
        throw new UnauthorizedException();
      }

      // Add user to request object
      request.user = user;

      return true;
    } catch (error) {
      console.log(error);
      throw new UnauthorizedException();
    }
  }

  private extractTokenFromHeader(request: any): { token: string | undefined, type: 'Bearer' | 'ApiKey' | undefined } {
    const apiKey = request.headers['x-api-key'];
    if (apiKey) {
      return { token: apiKey, type: 'ApiKey' };
    }

    const authHeader = request.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      return { token, type: 'Bearer' };
    }

    return { token: undefined, type: undefined };
  }
}

export function Auth() {
  return applyDecorators(
    UseGuards(AuthGuard)
  );
}

export const AuthUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): OpModelType<any> => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);