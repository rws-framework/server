import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Reflector } from '@nestjs/core';
import { RouterService } from '../services/RouterService';
import RWSError from '../errors/_error';
import path from 'path';

@Injectable()
export class RWSRouteInterceptor implements NestInterceptor {
    constructor(
        private reflector: Reflector,
        private routerService: RouterService
    ) {}

    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
        const handler = context.getHandler();
        const controller = context.getClass();
        const request = context.switchToHttp().getRequest();
        const response = context.switchToHttp().getResponse();

        // Check if this method has RWSRoute metadata
        const routeMetadata = this.getRouteMetadata(controller, handler.name);
        
        if (!routeMetadata) {
            // No RWSRoute decorator, let it pass through normally
            return next.handle();
        }

        return next.handle().pipe(
            map(data => {
                try {
                    // Process response through RouterService's prepareResponse logic
                    return this.processRWSResponse(
                        response, 
                        data, 
                        routeMetadata,
                        request
                    );
                } catch (error) {
                    console.error(`[RWSRouteInterceptor] Error processing response:`, error);
                    return data; // fallback to original data
                }
            })
        );
    }

    private getRouteMetadata(controller: any, methodName: string): any {
        const annotations = this.routerService.getRouterAnnotations(controller);
        return annotations[methodName]?.metadata || null;
    }

    private processRWSResponse(res: any, data: any, routeParams: any, req: any): any {
        const responseType = routeParams.params?.responseType || 'json';
        let status = 200;
        
        // Check if data is an RWSError
        try {
            if (data instanceof RWSError) {
                status = data.getCode();
            }
        } catch (e) {
            // If instanceof fails, check if it has getCode method
            if (data && typeof data.getCode === 'function') {
                status = data.getCode();
            }
        }
        
        // For JSON responses or no specific type, return original data
        if (responseType === 'json' || !responseType) {
            return { statusCode: status, ...data };
        }

        // For HTML responses
        if (responseType === 'html') {
            res.setHeader('Content-Type', 'text/html');
            if (data && data.template_name) {
                // Handle template rendering if needed - would need configService for pub_dir
                res.send(data);
                return;
            }
        }

        // For file/PDF responses, we need to handle them specially
        if (responseType === 'file' || responseType === 'pdf') {
            // Set proper content type
            const contentType = RouterService.responseTypeToMIME(responseType, routeParams.params?.mimeType);
            res.setHeader('Content-Type', contentType);
            
            // Determine if we should display inline or force download
            const displayMode = routeParams.params?.fileDisplay || 'download';
            
            // For file responses, output should contain file buffer/path and optionally filename
            if (typeof data === 'string') {
                // If output is a file path
                const filename = `file.${responseType === 'pdf' ? 'pdf' : 'bin'}`;
                if (displayMode === 'download') {
                    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
                } else {
                    res.setHeader('Content-Disposition', `inline; filename="${filename}"`);
                }
                res.sendFile(data);
                return; // Don't return data, response is handled by sendFile
            } else if (data && data.buffer) {
                // Handle both Buffer objects and serialized buffers
                let buffer = data.buffer;
                if (buffer.type === 'Buffer' && Array.isArray(buffer.data)) {
                    buffer = Buffer.from(buffer.data);
                }
                
                const filename = data.filename || `file.${responseType === 'pdf' ? 'pdf' : 'bin'}`;
                const displayMode = routeParams.params?.fileDisplay || 'download';
                if (displayMode === 'download') {
                    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
                } else {
                    res.setHeader('Content-Disposition', `inline; filename="${filename}"`);
                }
                res.status(status).send(buffer);
                return; // Don't return data, response is sent
            } else if (data && data.filePath) {
                // If output contains a file path
                const filename = data.filename || `file.${responseType === 'pdf' ? 'pdf' : 'bin'}`;
                const displayMode = routeParams.params?.fileDisplay || 'download';
                if (displayMode === 'download') {
                    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
                } else {
                    res.setHeader('Content-Disposition', `inline; filename="${filename}"`);
                }
                res.sendFile(data.filePath);
                return; // Don't return data, response is handled by sendFile
            }
            
            // Fallback: send as-is
            res.status(status).send(data);
            return;
        }

        // For raw responses  
        if (responseType === 'raw') {
            res.status(status).send(data);
            return;
        }

        // Default: return original data
        return data;
    }
}