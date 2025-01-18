import 'reflect-metadata';
import Model, { OpModelType } from '../_model';

interface IRelationOpts {
    required?: boolean
    key?: string
    relationField?: string
    relatedToField?: string
    relatedTo: OpModelType<Model<any>>
}
  
function Relation(theModel: () =>  OpModelType<Model<any>>, required: boolean = false, relationField: string = null, relatedToField: string = 'id') {
  
    return function(target: any, key: string) {     
        setTimeout(() => {                 
            const relatedTo = theModel();
            const metaOpts: IRelationOpts = {required, relatedTo, relatedToField};                    
            if(!relationField){
                metaOpts.relationField = relatedTo._collection + '_id';
            } else{
                metaOpts.relationField = relationField;
            }  
            metaOpts.key = key;
            Reflect.defineMetadata(`Relation:${metaOpts.relationField}`, metaOpts, target);
        }, 0);
    };
}

export default Relation;
export {IRelationOpts};