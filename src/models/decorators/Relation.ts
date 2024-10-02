import 'reflect-metadata';

import TheModel, { OpModelType } from '../_model'

export interface IRelationOpts{
    required?: boolean,
    relationField?: string
    relatedToField?: string,
    relatedTo?: string,
    inversionModel?: string,
  }
  
function Relation(relatedTo: string, relationField: string = null, required: boolean = false,  relatedToField: string | null = 'id') {   
    return function(target: any, key: string) {          
        const metaOpts: IRelationOpts = {required};          

        metaOpts.relatedTo = relatedTo;
        metaOpts.relatedToField = relatedToField;
    
        if(!relationField){
            metaOpts.relationField = metaOpts.relatedTo + '_id';
        } else{
            metaOpts.relationField = relationField;
        }

        Reflect.defineMetadata(`Relation:${key}`, metaOpts, target);
    };
}

export default Relation;
export {IRelationOpts};