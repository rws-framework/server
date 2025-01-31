import { INestApplication } from '@nestjs/common';

export type RunCallback = (app: INestApplication) => Promise<void>;
