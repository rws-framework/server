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
                this.logger.debug(`Request Path: ${req.path}`);
            }

            // Skip API routes - let them be handled by NestJS controllers
            if (req.originalUrl.startsWith('/api/')) {
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

                if(this.config.devMode){
                    this.logger.verbose(`Serving URL: ${req.url}`);
                }

  
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