import { DynamicModule, MiddlewareConsumer, Module, NestModule, Inject } from '@nestjs/common';
import express from 'express';
import path from 'path';
import fs from 'fs';
import IAppConfig from '../types/IAppConfig'; // adjust import to your interface
import { rwsPath } from '@rws-framework/console';
import { parse } from 'url';
import { BlackLogger } from '../../nest';
import { AntiFloodService } from '../services/AntiFloodService';
import { RWSConfigService } from '../services/RWSConfigService';
import { RouterService } from '../services/RouterService';
import { IHTTProute } from '../routing/routes';
import { ConsoleService } from '../services/ConsoleService';

@Module({})
export class FilteredServeModule implements NestModule {
    private logger: BlackLogger = new BlackLogger(this.constructor.name);
    constructor(
        @Inject('APP_CONFIG') private readonly config: IAppConfig,
        private readonly antifloodService: AntiFloodService,
        private readonly routerService: RouterService
    ) {
        this.logger.disableWinston();
    }

    configure(consumer: MiddlewareConsumer) {
        const publicPath = path.join(rwsPath.findRootWorkspacePath(), this.config.pub_dir);

        const staticMiddleware = express.static(publicPath, { redirect: false, fallthrough: false });

        const callback = async (req: express.Request, res: express.Response, next: (err?: any) => void): Promise<void> => {
            
            if(this.config.devMode){
                this.logger.debug(`Request URL: ${req.originalUrl}`);                
            }            

            const parsedUrl = parse(req.originalUrl, /* parseQueryString */ true);
            const pathname = parsedUrl.pathname || req.originalUrl;

            // Skip API routes - let them be handled by NestJS controllers
            if (this.isServerRoute(pathname)) {
                next();
                return;
            }         

            if (/\.[a-zA-Z0-9]+$/.test(pathname)) {
       
                const filePath = path.join(publicPath, pathname);
                const fileExists = fs.existsSync(filePath);

                if(!fileExists){
                    if(pathname.includes('com.chrome.devtools.json')){
                        res.json({});
                        return;
                    }

                    const notFoundMsg = `File ${filePath} not found.`;
                    if(this.config.devMode){
                        this.logger.error(notFoundMsg);
                    }

                    if(await this.antifloodService.shouldBlock(req, '404')){
                        res.status(429).send('Too many requests');
                        return;
                    }

                    res.status(404).send(notFoundMsg);
                    return;
                }

                if (await this.antifloodService.shouldBlock(req, 'serve')) {
                    res.status(429).send('Too many requests');
                    return;
                }

                const originalUrl = req.url;        
                req.url = '.' + pathname;               

                res.once('finish', () => {
                    if (res.statusCode === 304) {
                        this.antifloodService.rollbackCachedRequest(req);
                    }
                });
  
                staticMiddleware(req, res, (err) => {
                    req.url = originalUrl;
                    if (err) {
                        return next(err);
                    }                 
                });
            } else {
                next();
            }
        };

        consumer
            .apply(callback)
            .forRoutes('*');
    }

    isServerRoute(requestPath: string): boolean {
        const debLog = (...args: any[]) => {
            if(this.config.devMode && requestPath.startsWith('/uploads/')){
                console.log(...args);
            }
        }

        const httpRoutes = this.config.http_routes || [];
        
        // Flatten all routes into a single list with their full paths.
        // Routes are stored as prefix + path, so build absolute full paths.
        const flatRoutes: IHTTProute[] = this.routerService.flattenRoutes(httpRoutes);

        // Sort by priority descending (higher priority checked first).
        // Within the same priority, check non-wildcard routes before wildcard routes.
        flatRoutes.sort((a, b) => {
            const priorityDiff = (b.priority ?? 0) - (a.priority ?? 0);
            if (priorityDiff !== 0) {
                return priorityDiff;
            }
            const aWildcard = String(a.path).includes('*');
            const bWildcard = String(b.path).includes('*');
            return Number(aWildcard) - Number(bWildcard);
        });

        for (const route of flatRoutes) {
            const paths = Array.isArray(route.path) ? route.path : [route.path];

            for (const fullPath of paths) {
                // Skip root-level catch-all routes (e.g. /*frontRoute)
                // but keep prefixed wildcards (e.g. /image/*path)
                if (/^\/?\*/.test(fullPath)) {
                    continue;
                }

                // Convert route params like {:id} or :id to a regex wildcard
                // Convert wildcards like *path to match any remaining path segments
                // Normalize trailing slash so /api/user matches /api/user/
                const normalizedPath = fullPath.length > 1 && fullPath.endsWith('/') ? fullPath.slice(0, -1) : fullPath;
                const pattern = normalizedPath
                    .replace(/\{:[^}]+\}/g, '[^/]+')
                    .replace(/:[^/]+/g, '[^/]+')
                    .replace(/\*[^/]*/g, '.+');
                const regex = new RegExp(`^${pattern}/?$`);
                
                if (regex.test(requestPath)) {
                    return true;
                }
            }
        }

        return false;
    }

    static forRoot(config: IAppConfig): DynamicModule {
        return {
            module: FilteredServeModule,
            providers: [
                AntiFloodService,
                RWSConfigService,
                RouterService,
                ConsoleService,
                {
                    provide: 'APP_CONFIG',
                    useValue: config,
                },
            ],
            exports: [RouterService],
        };
    }
}
