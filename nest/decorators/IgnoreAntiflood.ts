import { SetMetadata } from '@nestjs/common';

export const RWS_IGNORE_ANTIFLOOD_KEY = 'rws:ignore-antiflood';

/**
 * Marks a controller route (or an entire controller) to be skipped by the anti-flood guard.
 */
export const IgnoreAntiflood = () => SetMetadata(RWS_IGNORE_ANTIFLOOD_KEY, true);
