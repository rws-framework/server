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
    private logsEnabled = false;
    private readonly clients = new Map<string, IAntiFloodClientRecord>();
    private windowS = M; // 60 seconds per window
    private maxRequestsPerWindow = 30; // max total requests from a single IP within the window
    private max404RequestsPerWindow = 20; // max 404 (missing resource) responses served to a single IP within the window, used to detect probing/scanners
    private maxServeRequestsPerWindow = 30; // max static file requests served to a single IP within the window
    private maxProbes = 3; // max probe signals (suspicious user agents, etc.) from a single IP within the window, tracked per IP regardless of route
    private blockMinutes = 15 * M; // duration of a temporary block after a threshold is exceeded
    private maxStrikes = 3; // number of temporary blocks before a permanent ban is applied

    private readonly ignorePaths: string[] = [];
    private readonly ignoreIPs: string[] = [];

    private readonly suspiciousAgents: string[] = [];

    constructor(
        private readonly config: RWSConfigService<IAppConfig>,
        private readonly routerService: RouterService
    ) {}

    onModuleInit() {
        const antifloodConfig = this.config.get('features')?.antiflood;

        if (antifloodConfig) {
            if (antifloodConfig.windowS !== undefined) {
                this.windowS = antifloodConfig.windowS * S;
            }
            if (antifloodConfig.maxRequestsPerWindow !== undefined) {
                this.maxRequestsPerWindow = antifloodConfig.maxRequestsPerWindow;
            }
            if (antifloodConfig.max404RequestsPerWindow !== undefined) {
                this.max404RequestsPerWindow = antifloodConfig.max404RequestsPerWindow;
            }
            if (antifloodConfig.maxServeRequestsPerWindow !== undefined) {
                this.maxServeRequestsPerWindow = antifloodConfig.maxServeRequestsPerWindow;
            }
            if (antifloodConfig.maxProbes !== undefined) {
                this.maxProbes = antifloodConfig.maxProbes;
            }
            if (antifloodConfig.blockMinutes !== undefined) {
                this.blockMinutes = antifloodConfig.blockMinutes * M;
            }
            if (antifloodConfig.maxStrikes !== undefined) {
                this.maxStrikes = antifloodConfig.maxStrikes;
            }
            if (antifloodConfig.logs !== undefined) {
                this.logsEnabled = antifloodConfig.logs;
            }
            if (antifloodConfig.suspiciousAgents) {
                this.suspiciousAgents.push(...antifloodConfig.suspiciousAgents);
            }
            if (antifloodConfig.ignoredIPs) {
                this.ignoreIPs.push(...antifloodConfig.ignoredIPs);
            }
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

        this.log('debug', `[AntiFlood] INIT ignorePaths: ${this.stringify(this.ignorePaths)}`);
        this.log('debug', `[AntiFlood] INIT ignoreIPs: ${this.stringify(this.ignoreIPs)}`);
        this.log('debug', `[AntiFlood] INIT suspiciousAgents: ${this.stringify(this.suspiciousAgents)}`);
        this.log('debug', `[AntiFlood] INIT thresholds: ${this.stringify({
            maxRequestsPerWindow: this.maxRequestsPerWindow,
            max404RequestsPerWindow: this.max404RequestsPerWindow,
            maxServeRequestsPerWindow: this.maxServeRequestsPerWindow,
            maxProbes: this.maxProbes,
            blockMinutesMs: this.blockMinutes,
            maxStrikes: this.maxStrikes,
            windowMs: this.windowS
        })}`);
    }

    private stringify(obj: any): string {
        return JSON.stringify(obj, null, 2);

    }

    private log(level: 'debug' | 'warn' | 'error', message: string): void {
        if (!this.logsEnabled) {
            return;
        }
        this.logger[level](message);
    }

    async shouldBlock(req: Request, type: 'route' | '404' | 'serve'): Promise<boolean> {
        if (this.config.get('features')?.antiflood?.enabled !== true) {
            this.log('debug', `[AntiFlood] DISABLED via config, skipping check for ${req.path}`);
            return false;
        }

        for (const ignoredPath of this.ignorePaths) {
            if ((req.path || '/').includes(ignoredPath)) {
                // this.log('warn', `[AntiFlood] SKIPPED - path "${req.path}" matched ignorePath "${ignoredPath}"`);
                return false;
            }
        }        

        const ip = this.getIp(req);
        
        this.log('debug', `[AntiFlood] CHECKING ip=${ip} path=${req.path} method=${req.method}`);

        if (this.ignoreIPs.includes(ip)) {
            this.log('warn', `[AntiFlood] SKIPPED - ip ${ip} is in ignoreIPs`);
            return false;
        }

        let existingBan: any = null;
        try {
            existingBan = await AntifloodBans.findOneBy({ conditions: { ip } });
        } catch (err) {
            this.log('error', `[AntiFlood] AntifloodBans.find(${ip}) THREW - failing open (not blocking) for this request. Error: ${err instanceof Error ? err.message : String(err)}`);
        }

        const now = Date.now();

        if (existingBan) {
            const ban = Array.isArray(existingBan) ? existingBan[0] : existingBan;
            this.log('debug', `[AntiFlood] existing ban record for ${ip}, strikes=${ban.strikes}, bannedUntil=${ban.bannedUntil}`);
            
            if (ban.strikes >= this.maxStrikes) {
                this.log('error', `[AntiFlood] BLOCKED - ip ${ip} has maxStrikes from persisted ban`);
                return true;
            }

            if (ban.bannedUntil && new Date(ban.bannedUntil).getTime() > now) {
                this.log('error', `[AntiFlood] BLOCKED - ip ${ip} under DB ban until ${new Date(ban.bannedUntil).toISOString()}`);
                return true;
            }
        }

        const record = this.getRecord(ip);

        if (record.blockedUntil && record.blockedUntil.getTime() > now) {
            this.log('error', `[AntiFlood] BLOCKED - ip ${ip} still under temp block until ${record.blockedUntil.toISOString()}`);
            return true;
        }

        this.cleanOld(record, now);

        record.requests.push(now);

        const routeKey = type === 'route' ? (req.path || '/') : `__${type}__`;
        const routeHits = record.routes.get(routeKey) || [];
        routeHits.push(now);
        record.routes.set(routeKey, routeHits);

        // Probes are counted per IP, not per route, because we care about the
        // overall probing rate of a client rather than which paths they hit.
        if (this.isProbe(req)) {
            record.probes += 1;
        }

        this.log('debug', `[AntiFlood] COUNTS ip=${ip} type=${type} totalReq=${record.requests.length}/${this.maxRequestsPerWindow} routeReq=${routeHits.length} probes=${record.probes}/${this.maxProbes} clientMapSize=${this.clients.size}`);

        if (type === '404' && routeHits.length >= this.max404RequestsPerWindow) {
            this.log('error', `[AntiFlood] BLOCKING - ip ${ip} exceeded max404RequestsPerWindow`);
            await this.blockClient(req, record, now);
            return true;
        }

        if (type === 'serve' && routeHits.length >= this.maxServeRequestsPerWindow) {
            this.log('error', `[AntiFlood] BLOCKING - ip ${ip} exceeded maxServeRequestsPerWindow`);
            await this.blockClient(req, record, now);
            return true;
        }

        if (record.probes >= this.maxProbes) {
            this.log('error', `[AntiFlood] BLOCKING - ip ${ip} exceeded maxProbes`);
            await this.blockClient(req, record, now);
            return true;
        }

        if (record.requests.length >= this.maxRequestsPerWindow) {
            this.log('error', `[AntiFlood] BLOCKING - ip ${ip} exceeded maxRequestsPerWindow`);
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
            const ip = this.getIp(req);
            this.log('warn', `[AntiFlood] recordStrike(${ip}) resolved: ${ban.ip}`);
            this.log('warn', `Blocking client IP: ${ip}. Current strikes: ${ban.strikes}`);
            
            if (ban.strikes < this.maxStrikes) {
                record.blockedUntil = blockedUntilDate;
            } else {
                record.permaBan = true;
                this.log('error', `Client IP: ${ip} has been permanently banned.`);
            }
        } catch (err) {
            this.log('error', `[AntiFlood] AntifloodBans.recordStrike(${this.getIp(req)}) THREW - in-memory temp block still applied (bannedUntil set), but persisted strike count was NOT recorded. Error: ${err instanceof Error ? err.message : String(err)}`);
        }
    }

    private getRecord(ip: string): IAntiFloodClientRecord {
        let record = this.clients.get(ip);
        if (!record) {
            this.log('debug', `[AntiFlood] NEW client record created for ip=${ip}`);
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
            this.log('debug', `[AntiFlood] cleanOld trimmed requests ${beforeCount} -> ${record.requests.length}`);
        }

        // Clean old route-specific records
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
            this.log('debug', `[AntiFlood] getIp using x-forwarded-for header: "${forwarded}" -> ${ip}`);
            return ip;
        }
        this.log('debug', `[AntiFlood] getIp using req.ip: ${req.ip}`);
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
                this.log('warn', `[AntiFlood] PROBE detected via suspicious agent "${agent}" ua="${ua}"`);
                return true;
            }
        }

        return false;
    }
}
