import {DBService, getAppConfig} from "rws-js-server";

import TrackType, {IMetaOpts} from "./annotations/TrackType";
interface IModel{
    [key: string]: any;
    id: string | null;
    save: ()=>void;
    getCollection: ()=>string | null;
}

class Model<ChildClass> implements IModel{
    [key: string]: any;
    @TrackType(String)
    id: string;
    static _collection: string = null;

    static _BANNED_KEYS = ['_collection'];

    constructor(data?: any) {    
        if(!this.getCollection()){
            throw new Error('Model must have a collection defined');
        
        }

        if(!data){
            return;    
        }
  
        if(!this.hasTimeSeries()){
          this._fill(data);
        }else{
          throw new Error('Time Series not supported in synchronous constructor. Use `await Model.create(data)` static method to instantiate this model.');
        }
    }    

    protected _fill(data: any): Model<ChildClass>{
        for (const key in data) {
            if (data.hasOwnProperty(key)) {   
              
              const meta = Reflect.getMetadata(`InverseTimeSeries:${key}`, (this as any).constructor.prototype);
          
              if(meta){
                data[key] = {
                  create: data[key]
                }
              }else{
                this[key] = data[key];
              }                          
            }
        }       
        
        return this;
    }

    public async _asyncFill(data: any): Promise<ChildClass>{
      const collections_to_models: {[key: string]: any} = {};           
      const timeSeriesIds: {[key: string] : {collection: string, hydrationField:string,ids: string[]}} = this.getTimeSeriesModelFields();
      const _self: this = this;
      this.loadModels().forEach((model) => {
        collections_to_models[model.getCollection()] = model;      
      });      

      const seriesHydrationfields: string[] = [];      

      for (const key in data) {
        if (data.hasOwnProperty(key)) {
          if(seriesHydrationfields.includes(key)){
            continue;
          }                    

          const timeSeriesMetaData = timeSeriesIds[key]  
          
          if(timeSeriesMetaData){
            this[key] = data[key];
            const seriesModel = collections_to_models[timeSeriesMetaData.collection];
            
            const dataModels = await seriesModel.findBy({
              id: { in: data[key] }
            });                        

            seriesHydrationfields.push(timeSeriesMetaData.hydrationField);
            
            this[timeSeriesMetaData.hydrationField] = dataModels;
          } else {
            this[key] = data[key];            
          }        

        }        
      }     

      return this as any as ChildClass;
    }

    private getTimeSeriesModelFields()
    {
      const timeSeriesIds: {[key: string] : {collection: string, hydrationField:string, ids: string[]}} = {};

      for (const key in this as any) {
          if (this.hasOwnProperty(key)) {             
          
            const meta = Reflect.getMetadata(`InverseTimeSeries:${key}`, (this as any));            
            if(meta){
              if(!timeSeriesIds[key]){
                timeSeriesIds[key] = {
                  collection: meta.timeSeriesModel,
                  hydrationField: meta.hydrationField,
                  ids: this[key]
                };
              }
            }                         
          }
      } 

      return timeSeriesIds;
    }   

    public toMongo(): any{
       
        let data: any = {};

        const timeSeriesIds: {[key: string] : {collection: string, hydrationField:string, ids: string[]}} = this.getTimeSeriesModelFields();
        const timeSeriesHydrationFields: string[] = []
      
        for (const key in (this as any)) {                      
            if (this.hasOwnProperty(key) && !((this as any).constructor._BANNED_KEYS || Model._BANNED_KEYS).includes(key) && !timeSeriesHydrationFields.includes(key)) {              
              data[key] = this[key];
            }

            if(!!timeSeriesIds[key]){
              data[key] = this[key];
              timeSeriesHydrationFields.push(timeSeriesIds[key].hydrationField);              
            }
        }        

        return data;
    }   

    getCollection(): string | null {
        return (this as any).constructor._collection || this._collection;
    }

    static getCollection(): string | null {
      return (this as any).constructor._collection || this._collection;
  }


  async save(): Promise<this> {
    const data = this.toMongo();
    let updatedModelData = data;
  
    if (this.id) {
      this.preUpdate();

      updatedModelData = await DBService.update(data, this.getCollection());      

      await this._asyncFill(updatedModelData);
      this.postUpdate();
    } else {
      this.preCreate();      
      
      const timeSeriesModel = await import('./types/TimeSeriesModel');      
      const isTimeSeries = this instanceof timeSeriesModel.default;

      updatedModelData = await DBService.insert(data, this.getCollection(), isTimeSeries);      

      await this._asyncFill(updatedModelData);   

      this.postCreate();
    }
  
    return this;
  }

    static getModelAnnotations<T extends object>(constructor: new () => T): Record<string, {annotationType: string, metadata: any}> {    
      const annotationsData: Record<string, {annotationType: string, metadata: any}> = {};

      const propertyKeys: string[] = Reflect.getMetadataKeys(constructor.prototype).map((item: string): string => {
        return item.split(':')[1];
      });
      
      propertyKeys.forEach(key => {
        if(String(key) == 'id'){
          return
        }  

        const annotations: string[] = ['TrackType', 'Relation', 'InverseRelation', 'InverseTimeSeries'];

        annotations.forEach(annotation => {
          const metadataKey = `${annotation}:${String(key)}`;
        
          const meta = Reflect.getMetadata(metadataKey, constructor.prototype);
          
          if (meta) {
            annotationsData[String(key)] = {annotationType: annotation, metadata: meta};
          }
        });                 
      });

      return annotationsData;
    }

    public preUpdate(): void
    {
      return;
    }

    public postUpdate(): void
    {
      return;
    }

    public preCreate(): void
    {
      return;
    }

    public postCreate(): void
    {
      return;
    }

    public static isSubclass<T extends Model<T>, C extends new () => T>(constructor: C, baseClass: new () => T): boolean {
      return baseClass.prototype.isPrototypeOf(constructor.prototype);
    }

    hasTimeSeries(): boolean 
    {
      return Model.checkTimeSeries((this as any).constructor);
    }

    static checkTimeSeries(constructor: any): boolean
    {            
      const data = constructor.prototype as any;

      for (const key in data) {

        if (data.hasOwnProperty(key)) {   

          if(Reflect.getMetadata(`InverseTimeSeries:${key}`, constructor.prototype)){
            return true;
          }
        }
      }

      return false;
    }

    public static async watchCollection<ChildClass extends Model<ChildClass>>(
      this: { new(): ChildClass; _collection: string }, 
      preRun: () => void
    ){
      const collection = Reflect.get(this, '_collection');
      return await DBService.watchCollection(collection, preRun);
    }

    public static async findOneBy<ChildClass extends Model<ChildClass>>(
      this: { new(): ChildClass; _collection: string },
      conditions: any
    ): Promise<ChildClass | null> {
      const collection = Reflect.get(this, '_collection');
      const dbData = await DBService.findOneBy(collection, conditions);
    
      if (dbData) {
        const inst: ChildClass = new (this as { new(): ChildClass })();
        return await inst._asyncFill(dbData);
      }
    
      return null;
    }

    public static async delete<ChildClass extends Model<ChildClass>>(
      this: { new(): ChildClass; _collection: string },
      conditions: any
    ): Promise<void> {
      const collection = Reflect.get(this, '_collection');
      return await DBService.delete(collection, conditions);
    }

    public async delete<ChildClass extends Model<ChildClass>>(): Promise<void> {
      const collection = Reflect.get(this, '_collection');
      return await DBService.delete(collection, {
        id: this.id
      });  
    }    
    
    public static async findBy<ChildClass extends Model<ChildClass>>(
      this: { new(): ChildClass; _collection: string },    
      conditions: any
    ): Promise<ChildClass[]> {
      const collection = Reflect.get(this, '_collection');
      const dbData = await DBService.findBy(collection, conditions);
    
      if (dbData.length) {
        const instanced: ChildClass[] = [];
    
        for (const data of dbData) {
          const inst: ChildClass = new (this as { new(): ChildClass })();
          instanced.push((await inst._asyncFill(data)) as ChildClass);
        }
    
        return instanced;
      }
    
      return [];
    }
    

    static async create<T extends Model<T>>(this: new () => T, data: any): Promise<T> {
      const newModel = new this();
      await newModel._asyncFill(data);
    
      return newModel;
    }

    private loadModels(): Model<any>[]
    {
      const AppConfigService = getAppConfig();
  
      return AppConfigService.get('user_models');
    }
}



export default Model;
export { IModel, TrackType, IMetaOpts };