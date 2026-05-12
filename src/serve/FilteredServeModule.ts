import { DynamicModule, MiddlewareConsumer, Module, NestModule, Inject } from '@nestjs/common';
import express from 'express';
import path from 'path';
import fs from 'fs';
import IAppConfig from '../types/IAppConfig'; // adjust import to your interface
import { rwsPath } from '@rws-framework/console';
import { parse } from 'url';
import { BlackLogger } from '../../nest';

@Module({})
export class FilteredServeModule implements NestModule {
    private logger: BlackLogger = new BlackLogger(this.constructor.name);
    constructor(@Inject('APP_CONFIG') private readonly config: IAppConfig) {
        this.logger.disableWinston();
    }

    configure(consumer: MiddlewareConsumer) {
        const publicPath = path.join(rwsPath.findRootWorkspacePath(), this.config.pub_dir);

        const staticMiddleware = express.static(publicPath, { redirect: false, fallthrough: false });

        const callback = (req: express.Request, res: express.Response, next: (err?: any) => void): void => {
            
            if(this.config.devMode){
                this.logger.debug(`Request URL: ${req.originalUrl}`);                
            }            

            // Skip API routes - let them be handled by NestJS controllers
            if (this.isServerRoute(req.originalUrl)) {
                next();
                return;
            }

            const parsedUrl = parse(req.originalUrl, /* parseQueryString */ true);
            const pathname = parsedUrl.pathname || req.originalUrl;

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
                    res.status(404).send(notFoundMsg);
                    return;
                }

                const originalUrl = req.url;        
                req.url = '.' + pathname;               
  
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

        debLog('Checking server routes for path:', requestPath);

        // Flatten all routes into a single list with their full paths
        const flatRoutes: { fullPath: string; priority: number }[] = [];

        for (const group of httpRoutes) {
            for (const route of group.routes) {
                const paths = Array.isArray(route.path) ? route.path : [route.path];
                const priority = route.priority ?? 0;
                for (const routePath of paths) {
                    const fullPath = (group.prefix + routePath).replace(/\/+/g, '/');
                    flatRoutes.push({ fullPath, priority });
                }
            }
        }

        // Sort by priority descending (higher priority checked first)
        flatRoutes.sort((a, b) => b.priority - a.priority);

        for (const { fullPath, priority } of flatRoutes) {
            // Skip root-level catch-all routes (e.g. /*frontRoute)
            // but keep prefixed wildcards (e.g. /image/*path)
            if (/^\/?\*/.test(fullPath)) {
                continue;
            }

            // Convert route params like {:id} or :id to a regex wildcard
            // Convert wildcards like *path to match any remaining path segments
            const pattern = fullPath
                .replace(/\{:[^}]+\}/g, '[^/]+')
                .replace(/:[^/]+/g, '[^/]+')
                .replace(/\*[^/]*/g, '.+');
            const regex = new RegExp(`^${pattern}/?$`);
            debLog(`Checking route pattern: ${regex} (priority: ${priority}) against request path: ${requestPath}`);
            if (regex.test(requestPath)) {
                debLog(`Matched route pattern: ${regex} for request path: ${requestPath}`);
                return true;
            }
        }

        return false;
    }

    static forRoot(config: IAppConfig): DynamicModule {
        return {
            module: FilteredServeModule,
            providers: [
                {
                    provide: 'APP_CONFIG',
                    useValue: config,
                },
            ],
        };
    }
}