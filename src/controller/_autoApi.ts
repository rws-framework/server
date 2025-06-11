import 'reflect-metadata';

import { RWSAutoApi } from "./autoApi.decorator";
import { RWSAutoAPIService } from '../services/RWSAutoAPIService'
import { OpModelType, RWSModel } from "@rws-framework/db";
import { RWSCONTROLLER_METADATA_KEY, RWSControllerMetadata } from "./_decorator";
import { IPrefixedHTTProutes } from '../routing/routes';
import { Param } from '@nestjs/common';
import IAppConfig from '../types/IAppConfig';
import { RWSConfigService } from '../services/RWSConfigService';

interface IAutoApiServices {
    configService?: RWSConfigService<IAppConfig>;
    autoRouteService?: RWSAutoAPIService;    
    httpAdapter?: any;
}

type HTTPAdapter = any;

@RWSAutoApi()
export abstract class RWSAutoApiController {
    public static services: IAutoApiServices = {};
    
    private dbModel: OpModelType<any>;
    private autoRouteService: RWSAutoAPIService;
    private configService: RWSConfigService;
    private httpAdapter: HTTPAdapter;    

    static setServices(services: IAutoApiServices) {
        RWSAutoApiController.services = {...RWSAutoApiController.services, ...services};    
    }

    async onModuleInit() {
        if(RWSAutoApiController.services) {
            for(const key of Object.keys(RWSAutoApiController.services)){
                this[key as keyof this] = RWSAutoApiController.services[key as keyof IAutoApiServices];
            }        
        }    

        if(!this.getAutoApiMetadata().dbModel){
            throw new Error(`You need to add "dbModel" argument in ${this.constructor.name}'s @RWSController('controllerName', DBMODEL)`)
        }

        this.setDbModel(this.getAutoApiMetadata().dbModel);

        this.setupCrudRoutes();
    }    

    getHttpAdapter(): HTTPAdapter
    {
        return this.httpAdapter;
    }
    
    async findManyAction<T extends OpModelType<any>>(): Promise<T[]> {                         
        return await this.dbModel.findBy({ });
    }

    async findOneAction<T extends OpModelType<any>>(id: string): Promise<T> {
        return await this.dbModel.find(id);
    }

    async createAction<T extends OpModelType<any>>(data: any): Promise<T> {                      
        const model = await this.dbModel.create(data);
        await model.save();        

        return model;
    }

    async updateAction(id: string, data: any): Promise<any> {
        const model = await this.dbModel.find<RWSModel<any>>(id);        
        await model._asyncFill(data);
        await model.save();

        return model;    
    }

    async removeAction(@Param('id') id: string): Promise<void> {
        await this.dbModel.delete({id});
    }
    
    protected setupCrudRoutes(basePath: string = '/'): void {
        const controllerMeta: RWSControllerMetadata = this.getAutoApiMetadata();
        
        const controllerRoute: IPrefixedHTTProutes = this.configService.get('http_routes').find((item => item.controllerName === controllerMeta.name));

        if(controllerRoute && controllerRoute.exportAutoRoutes){
            this.autoRouteService.createCrudRoutes(this, controllerRoute.prefix);
        }        
    }

    protected getAutoApiMetadata(): RWSControllerMetadata {
        return Reflect.getMetadata(RWSCONTROLLER_METADATA_KEY, this.constructor)
    }
    
    protected createCustomRoute(path: string, method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH', handler: Function): void {
        this.autoRouteService.createRoute({
            path,
            method,
            handler: handler.bind(this)
        });
    }

    public getDbModel(): OpModelType<any>
    {
        return this.dbModel;
    }    

    public setDbModel(model: OpModelType<any>){
        this.dbModel = model;
    }    
}