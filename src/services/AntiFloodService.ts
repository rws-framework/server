import { Injectable, OnModuleInit } from '@nestjs/common';
import { Request } from 'express';
import { IAntiFloodClientRecord } from '../types/antiflood.types';
import { RWSConfigService } from './RWSConfigService';
import { RouterService } from './RouterService';
import AntifloodBans from '../models/AntifloodBans.model';
import { appliedRWSControllers } from '../../nest/decorators/RWSRoute';
import IAppConfig from '../types/IAppConfig';
import { BlackLogger } from '../../nest';

const S = 1000; // 1 second in milliseconds
const M = 60 * S; // 1 minute in milliseconds

@Injectable()
export class AntiFloodService implements OnModuleInit {
    private logger = new BlackLogger(this.constructor.name);
    private readonly clients = new Map<string, IAntiFloodClientRecord>();
    private readonly windowS = M; // 60 seconds per window
    private readonly maxRequestsPerWindow = 120;
    private readonly maxRequestsPerRoutePerWindow = 40;
    private readonly maxProbes = 3;
    private readonly blockMinutes = 15 * M;
    private readonly maxStrikes = 3;

    private readonly ignorePaths: string[] = [];
    private readonly ignoreIPs: string[] = [];

    private readonly suspiciousAgents: string[] = [];

    constructor(
        private readonly config: RWSConfigService<IAppConfig>,
        private readonly routerService: RouterService
    ) {}

    onModuleInit() {
        const antifloodConfig = this.config.get('features')?.antiflood;
        if (antifloodConfig?.suspiciousAgents) {
            this.suspiciousAgents.push(...antifloodConfig.suspiciousAgents);
        }

        if (antifloodConfig?.ignoredIPs) {
            this.ignoreIPs.push(...antifloodConfig.ignoredIPs);
        }

        for (const controller of appliedRWSControllers) {
            const annotations = this.routerService.getRouterAnnotations(controller);
            for (const methodName of Object.keys(annotations)) {
                const meta = annotations[methodName]?.metadata;
                if (meta?.ignoreAntiflood) {
                    const path = meta.path;
                    if (Array.isArray(path)) {
                        this.ignorePaths.push(...path);
                    } else if (typeof path === 'string') {
                        this.ignorePaths.push(path);
                    }
                }
            }
        }

        console.log('[AntiFlood] INIT ignorePaths:', this.ignorePaths);
        console.log('[AntiFlood] INIT ignoreIPs:', this.ignoreIPs);
        console.log('[AntiFlood] INIT suspiciousAgents:', this.suspiciousAgents);
        console.log('[AntiFlood] INIT thresholds:', {
            maxRequestsPerWindow: this.maxRequestsPerWindow,
            maxRequestsPerRoutePerWindow: this.maxRequestsPerRoutePerWindow,
            maxProbes: this.maxProbes,
            windowMs: this.windowS
        });
    }

    async shouldBlock(req: Request): Promise<boolean> {
        if (this.config.get('features')?.antiflood?.enabled !== true) {
            console.log('[AntiFlood] DISABLED via config, skipping check for', req.path);
            return false;
        }

        for (const ignoredPath of this.ignorePaths) {
            if ((req.path || '/').includes(ignoredPath)) {
                console.warn(`[AntiFlood] SKIPPED - path "${req.path}" matched ignorePath "${ignoredPath}"`);
                return false;
            }
        }        

        const ip = this.getIp(req);
        
        console.log(`[AntiFlood] CHECKING ip=${ip} path=${req.path} method=${req.method}`);

        if (this.ignoreIPs.includes(ip)) {
            console.log(`[AntiFlood] SKIPPED - ip ${ip} is in ignoreIPs`);
            return false;
        }

        let existingBan: any = null;
        try {
            existingBan = await AntifloodBans.findOneBy({ conditions: { ip } });
        } catch (err) {
            console.error(`[AntiFlood] AntifloodBans.find(${ip}) THREW - failing open (not blocking) for this request. Error:`, err);
        }

        const now = Date.now();

        if (existingBan) {
            const ban = Array.isArray(existingBan) ? existingBan[0] : existingBan;
            console.log(`[AntiFlood] existing ban record for ${ip}, strikes=${ban.strikes}, bannedUntil=${ban.bannedUntil}`);
            
            if (ban.strikes >= this.maxStrikes) {
                console.log(`[AntiFlood] BLOCKED - ip ${ip} has maxStrikes from persisted ban`);
                return true;
            }

            if (ban.bannedUntil && new Date(ban.bannedUntil).getTime() > now) {
                console.log(`[AntiFlood] BLOCKED - ip ${ip} under DB ban until ${new Date(ban.bannedUntil).toISOString()}`);
                return true;
            }
        }

        const record = this.getRecord(ip);

        if (record.blockedUntil && record.blockedUntil.getTime() > now) {
            console.log(`[AntiFlood] BLOCKED - ip ${ip} still under temp block until ${record.blockedUntil.toISOString()}`);
            return true;
        }

        this.cleanOld(record, now);

        record.requests.push(now);

        const routeKey = req.path || '/';
        let routeHits = record.routes.get(routeKey);
        if (!routeHits) {
            routeHits = [];
            record.routes.set(routeKey, routeHits);
        }
        routeHits.push(now);

        if (this.isProbe(req)) {
            record.probes += 1;
        }

        console.log(`[AntiFlood] COUNTS ip=${ip} path=${routeKey} totalReq=${record.requests.length}/${this.maxRequestsPerWindow} routeReq=${routeHits.length}/${this.maxRequestsPerRoutePerWindow} probes=${record.probes}/${this.maxProbes} clientMapSize=${this.clients.size}`);

        if (record.probes >= this.maxProbes) {
            console.log(`[AntiFlood] BLOCKING - ip ${ip} exceeded maxProbes`);
            await this.blockClient(req, record, now);
            return true;
        }

        if (record.requests.length > this.maxRequestsPerWindow) {
            console.log(`[AntiFlood] BLOCKING - ip ${ip} exceeded maxRequestsPerWindow`);
            await this.blockClient(req, record, now);
            return true;
        }

        if (routeHits.length > this.maxRequestsPerRoutePerWindow) {
            console.log(`[AntiFlood] BLOCKING - ip ${ip} exceeded maxRequestsPerRoutePerWindow on ${routeKey}`);
            await this.blockClient(req, record, now);
            return true;
        }

        return false;
    }

    isRouteIgnored(controller: any, methodName: string): boolean {
        const annotations = this.routerService.getRouterAnnotations(controller);
        return annotations[methodName]?.metadata?.ignoreAntiflood === true;
    }

    private async blockClient(req: Request, record: IAntiFloodClientRecord, now: number): Promise<void> {
        const blockedUntilDate = new Date(now + this.blockMinutes);
        record.blockedUntil = blockedUntilDate;

        try {
            const ban = await AntifloodBans.recordStrike(req);
            console.log(`[AntiFlood] recordStrike(${this.getIp(req)}) resolved:`, ban.ip);
            this.logger.warn(`Blocking client IP: ${this.getIp(req)}. Current strikes: ${ban.strikes}`);
            
            if (ban.strikes < this.maxStrikes) {
                record.blockedUntil = blockedUntilDate;
            } else {
                record.permaBan = true;
                this.logger.error(`Client IP: ${this.getIp(req)} has been permanently banned.`);
            }
        } catch (err) {
            console.error(`[AntiFlood] AntifloodBans.recordStrike(${this.getIp(req)}) THREW - in-memory temp block still applied (bannedUntil set), but persisted strike count was NOT recorded. Error:`, err);
        }
    }

    private getRecord(ip: string): IAntiFloodClientRecord {
        let record = this.clients.get(ip);
        if (!record) {
            console.log(`[AntiFlood] NEW client record created for ip=${ip}`);
            record = {
                requests: [],
                routes: new Map(),
                probes: 0,
                blockedUntil: null,
                permaBan: false
            };
            this.clients.set(ip, record);
        }
        return record;
    }

    private cleanOld(record: IAntiFloodClientRecord, now: number): void {
        const beforeCount = record.requests.length;
        record.requests = record.requests.filter(t => now - t <= this.windowS);
        if (beforeCount !== record.requests.length) {
            console.log(`[AntiFlood] cleanOld trimmed requests ${beforeCount} -> ${record.requests.length}`);
        }
        for (const [route, hits] of record.routes.entries()) {
            const fresh = hits.filter(t => now - t <= this.windowS);
            if (fresh.length === 0) {
                record.routes.delete(route);
            } else {
                record.routes.set(route, fresh);
            }
        }
    }

    private getIp(req: Request): string {
        const forwarded = req.headers['x-forwarded-for'];
        if (typeof forwarded === 'string') {
            const ip = forwarded.split(',')[0].trim();
            console.log(`[AntiFlood] getIp using x-forwarded-for header: "${forwarded}" -> ${ip}`);
            return ip;
        }
        console.log(`[AntiFlood] getIp using req.ip: ${req.ip}`);
        return req.ip || 'unknown';
    }

    private isProbe(req: Request): boolean {
        const path = (req.path || '').toLowerCase();
        const ua = (req.headers['user-agent'] || '').toLowerCase();

        for (const probe of this.ignorePaths) {
            if (path.includes(probe)) {
                return false;
            }
        }

        for (const agent of this.suspiciousAgents) {
            if (ua.includes(agent)) {
                console.log(`[AntiFlood] PROBE detected via suspicious agent "${agent}" ua="${ua}"`);
                return true;
            }
        }

        return false;
    }
}