import { Injectable, CanActivate, ExecutionContext, UnauthorizedException, applyDecorators, UseGuards, createParamDecorator, Inject } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from './public.decorator';
import IAppConfig from '../../../src/types/IAppConfig';
import { RWSConfigService } from '../../../src/services/RWSConfigService';
import { AuthService } from '../../../src/services/AuthService';
import { OpModelType } from '@rws-framework/db';

export const RWS_PROTECTED_KEY = 'rws_protected';

@Injectable()
export class AuthGuard implements CanActivate {
  private rwsConfigFeatures: IAppConfig['features'];
  constructor(
    @Inject(RWSConfigService) private configService: RWSConfigService<IAppConfig>,
    @Inject(AuthService) private authService: AuthService,
    private reflector: Reflector
  ) {
    this.rwsConfigFeatures = this.configService.get('features');
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {    
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

    const {token, type} = this.extractTokenFromHeader(request);

    if (!token) {
      throw new UnauthorizedException();
    }

    try {
      const user = await this.authService.authenticateFromCredentials(token, type);

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