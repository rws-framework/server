import 'reflect-metadata';
import Model, { OpModelType } from '../_model';

interface InverseRelationOpts{
    key: string,
    inversionModel: OpModelType<Model<any>>,
    foreignKey: string    
  }

function InverseRelation(inversionModel: () => OpModelType<Model<any>>, sourceModel: () => OpModelType<Model<any>>,foreignKey: string = null) {    
    return function(target: any, key: string) {     
        setTimeout(() => {    
            const model = inversionModel();
            const source = sourceModel();
    
            const metaOpts: InverseRelationOpts = {
                key,
                inversionModel: model,
                foreignKey: foreignKey ? foreignKey : `${source._collection}_id`
            };             
    
            Reflect.defineMetadata(`InverseRelation:${key}`, metaOpts, target);
        }, 0);       
    };
}

export default InverseRelation;
export {InverseRelationOpts};