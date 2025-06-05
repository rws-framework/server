import { INestApplication } from '@nestjs/common';

export type RunCallback = (app: INestApplication) => Promise<void>;

export type RunCallbackList = {
    preInit?: RunCallback,
    afterInit?: RunCallback,
    preServerStart?: RunCallback
}