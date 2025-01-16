import 'reflect-metadata';

interface InverseRelationOpts{
    required?: boolean,
    relationField?: string
    relatedToField?: string,
    relatedTo?: string,
    inversionModel?: string    
  }
  
function InverseRelation(inversionModel: string) {
    return function(target: any, key: string) {          
        const metaOpts: InverseRelationOpts = {
            inversionModel,

        };
        Reflect.defineMetadata(`InverseRelation:${key}`, metaOpts, target);
    };
}

export default InverseRelation;
export {InverseRelationOpts};