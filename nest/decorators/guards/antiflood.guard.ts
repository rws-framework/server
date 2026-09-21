import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { AntiFloodService } from '../../../src/services/AntiFloodService';
import { RWS_IGNORE_ANTIFLOOD_KEY } from '../IgnoreAntiflood';

@Injectable()
export class AntiFloodGuard implements CanActivate {
    constructor(
        private readonly reflector: Reflector,
        private readonly antiFloodService: AntiFloodService
    ) {}

    canActivate(context: ExecutionContext): boolean {
        const ignoreAntiflood = this.reflector.getAllAndOverride<boolean>(RWS_IGNORE_ANTIFLOOD_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);

        if (ignoreAntiflood) {
            return true;
        }

        const request = context.switchToHttp().getRequest<Request>();
        return !this.antiFloodService.shouldBlock(request);
    }
}
