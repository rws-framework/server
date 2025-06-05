import 'reflect-metadata';

import { IRWSCollectionMeta, OpModelType, RWSModel } from '@rws-framework/db';
import { RWSConfigService } from '../services/RWSConfigService';

import {  Controller, Get, Param } from '@nestjs/common';
import { IKDBTypeInfo, IKDBTypesResponse } from '../types/CoreTypes';
import { IRWSResourceOpts, IRWSResourceMeta } from '../decorators/resource';


@Controller('/api/rws')
class RWSCoreController {
    constructor(private configService: RWSConfigService){}

    @Get('/resource/:resourceName')
    public async getResourceAction(@Param('resourceName') resourceName: string): Promise<IKDBTypesResponse> {
        // Get all decorated properties from KDB model using reflection
        const types: IKDBTypeInfo[] = [];

        const models: OpModelType<any>[] = this.configService.get('db_models');           

        const chosen_model = models.find((item) => {
            const collectionMeta: IRWSResourceMeta = Reflect.getMetadata('RWSResource', item);   
            return collectionMeta.resourceName === resourceName;
        });


        if(!chosen_model){
            throw new Error('No model found.');
        }

        let metadata: Record<string, {
            annotationType: string;
            metadata: any;
        }> = await RWSModel.getModelAnnotations(chosen_model);

        if(!chosen_model || !metadata){
            throw new Error('No model found for resource: ' + resourceName);
        }        

        for (const key of Object.keys(metadata)) {
            const metadataItem = metadata[key];
            switch(metadataItem.annotationType){
                case 'TrackType': 
                    types.push({
                        fieldName: key,
                        type: metadataItem.metadata.type.name
                    });                                    
                break;
                case 'Relation': 
                
                    types.push({
                        fieldName: key,
                        type: 'Relation',
                        boundModel: metadataItem.metadata.relatedTo._collection
                    });
                    break;
            }            
        }

        return {
            success: true,
            data: {
                types
            }
        };
    }
}

export { RWSCoreController };
