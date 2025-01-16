import 'reflect-metadata';

interface IRelationOpts {
    required?: boolean,
    relationField?: string
    relatedToField?: string,
    relatedTo?: string,
}
  
function Relation(relatedTo: string, required: boolean = false, relationField: string = null, relatedToField: string = 'id') {
  
    const metaOpts: IRelationOpts = {required};
  
    metaOpts.relatedToField = relatedToField;      
    metaOpts.relatedTo = relatedTo;

    if(!relationField){
        metaOpts.relationField = relatedTo + '_id';
    } else{
        metaOpts.relationField = relationField;
    }  
  
    return function(target: any, key: string) {          
        Reflect.defineMetadata(`Relation:${key}`, metaOpts, target);
    };
}

export default Relation;
export {IRelationOpts};