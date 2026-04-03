import { Controller, applyDecorators, SetMetadata, UseGuards } from '@nestjs/common';
import { RWSHTTPRoutingEntry } from '../../src/routing/routes';
import { BootstrapRegistry } from './RWSConfigInjector';
import { AuthGuard, RWS_PROTECTED_KEY } from './guards/auth.guard';
import { RWSControllerDecorator, applyDeferredControllerMetadata } from '../../src/controller/_decorator';

export interface RWSControllerOptions {
    public?: boolean;
}

// Re-export the canonical implementation so both import paths resolve to the same decorator
export const RWSController = RWSControllerDecorator;

export { applyDeferredControllerMetadata as applyRWSControllerMetadata };