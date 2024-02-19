import 'reflect-metadata';

interface InverseRelationOpts{
    required?: boolean,
    relationField?: string
    relatedToField?: string,
    relatedTo?: string,
    inversionModel?: string,
  }
  
function InverseRelation(inversionModel: string) {
  
    const metaOpts: InverseRelationOpts = {
        inversionModel: inversionModel
    };

  
    return function(target: any, key: string) {          
        Reflect.defineMetadata(`InverseRelation:${key}`, metaOpts, target);
    };
}

export default InverseRelation;
export {InverseRelationOpts};