import 'reflect-metadata';

import { TrackedRWSTypes, ITrackerOpts, IMetaOpts } from '../types/TrackedTypes';
  
function TrackType(type: TrackedRWSTypes & { _collection?: string }, opts: ITrackerOpts | null = null, tags: string[] = []) {
    if(!opts){
        opts = {
            required: false
        };
    }
  
    const required = opts.required;
  
    const metaOpts: IMetaOpts = {type, tags, required};
  
    if(opts.relatedToField && opts.relatedTo){
        metaOpts.relatedToField = opts.relatedToField;      
        metaOpts.relatedTo = opts.relatedTo;

        if(!opts.relationField){
            metaOpts.relationField = opts.relatedTo + '_id';
        } else{
            metaOpts.relationField = opts.relationField;
        }
    }     
  
    if(opts.inversionModel){
        metaOpts.inversionModel = opts.inversionModel;  
    }
  
    //const resolvedType = typeof type === 'function' ? type() : type;   
    
    if(type._collection){    
        metaOpts.type = (type as any);
    }
  
    return function(target: any, key: string) {          
        Reflect.defineMetadata(`TrackType:${key}`, metaOpts, target);
    };
}

export default TrackType;
export {IMetaOpts, ITrackerOpts};