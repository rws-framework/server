import 'reflect-metadata';
import { OpModelType } from '../_model';

interface InverseRelationOpts{
    required?: boolean,
    relationField?: string
    relatedToField?: string,
    relatedTo?: string,
    inversionModel?: string,
    trgt?: any;
  }
  
function InverseRelation(inversionModel: string, inversionField?: string) {  
    return function(target: any, key: string) {              
        const metaOpts: InverseRelationOpts = {
            inversionModel: inversionModel      
        };

        if(!inversionField){
            inversionField = target.constructor.name.toLowerCase();
        }

        metaOpts.relatedToField = inversionField;
        
        Reflect.defineMetadata(`InverseRelation:${key}`, metaOpts, target);
    };
}

export default InverseRelation;
export {InverseRelationOpts};