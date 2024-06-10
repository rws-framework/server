import { Error500, RWSError } from '../errors';

import DBService from '../services/DBService';
import getAppConfig from '../services/AppConfigService';

import TrackType, { IMetaOpts } from './annotations/TrackType';
import IDbUser from '../interfaces/IDbUser';
import { IRelationOpts } from './annotations/Relation';

interface IModel {
    [key: string]: any;
    id: string | null;
    save: () => void;
    getCollection: () => string | null;
}
type AnnotationType = { annotationType: string, key: string, metadata: IRelationOpts };

interface OpModelType<ChildClass> {
    _RELATIONS: { [key: string]: boolean; };
    new(): ChildClass;
    name: string
    _collection: string;
    loadModels: () => { [key: string]: Model<any> };
    checkForInclusionWithThrow: (className: string) => void;
    checkForInclusion: (className: string) => boolean;
    getCollection(): string | null;
    isRelationVariable: (variable: string) => boolean;
    getRelationData: (object: any, key: string) => any
    getIncludes(): { [key: string]: boolean }
}

class Model<ChildClass> implements IModel {
    [key: string]: any;
    @TrackType(String)
    id: string;
    static _collection: string = null;

    static _BANNED_KEYS = ['_collection'];
    static _RELATIONS: {[key: string]: boolean} = {}

    constructor(data?: any) {
        if (!this.getCollection()) {
            throw new Error('Model must have a collection defined');
        }

        if (!data) {
            return;
        }

        this.checkForInclusionWithThrow();

        if (!this.hasTimeSeries()) {
            this._fill(data);
        } else {
            throw new Error('Time Series not supported in synchronous constructor. Use `await Model.create(data)` static method to instantiate this model.');
        }
    }

    checkForInclusionWithThrow(): void {
        Model.checkForInclusionWithThrow(this.constructor.name)
    }

    static checkForInclusionWithThrow(this: OpModelType<any>, checkModelType: string): void {
        if (!this.checkForInclusion(this.name)) {
            throw new Error500(new Error('Model undefined: ' + this.name), this.name);
        }
    }

    checkForInclusion(): boolean {
        return Model.checkForInclusion(this.constructor.name);
    }

    static checkForInclusion(this: OpModelType<any>, checkModelType: string): boolean {
        return Object.values(this.loadModels()).find((definedModel: Model<any>) => {
            return definedModel.name === checkModelType
        }) !== undefined
    }

    protected _fill(data: any): Model<ChildClass> {
        for (const key in data) {
            if (data.hasOwnProperty(key)) {

                const meta = Reflect.getMetadata(`InverseTimeSeries:${key}`, (this as any).constructor.prototype);

                if (meta) {
                    data[key] = {
                        create: data[key]
                    };
                } else {
                    this[key] = data[key];
                }
            }
        }

        return this;
    }

    public async _asyncFill(data: any): Promise<ChildClass> {   
        const collections_to_models: { [key: string]: any } = {};
        const timeSeriesIds: { [key: string]: { collection: string, hydrationField: string, ids: string[] } } = this.getTimeSeriesModelFields();

        Object.values(this.loadModels()).forEach((model) => {
            collections_to_models[model.getCollection()] = model;
        });

        const seriesHydrationfields: string[] = [];

        for (const key in data) {
            if (data.hasOwnProperty(key)) {
                if (seriesHydrationfields.includes(key)) {
                    continue;
                }

                const timeSeriesMetaData = timeSeriesIds[key];

                if (timeSeriesMetaData) {
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

    private getTimeSeriesModelFields() {
        const timeSeriesIds: { [key: string]: { collection: string, hydrationField: string, ids: string[] } } = {};

        for (const key in this as any) {
            if (this.hasOwnProperty(key)) {

                const meta = Reflect.getMetadata(`InverseTimeSeries:${key}`, (this as any));
                if (meta) {
                    if (!timeSeriesIds[key]) {
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

    public toMongo(): any {

        const data: any = {};

        const timeSeriesIds: { [key: string]: { collection: string, hydrationField: string, ids: string[] } } = this.getTimeSeriesModelFields();
        const timeSeriesHydrationFields: string[] = [];

        for (const key in (this as any)) {
            if (this.isRelationVariable(key)) {
                const relData = this.getRelationData(key);
                
                if(!relData){
                    continue;
                }                

                if(!!this[key]){
                    data[key] = { connect: { id: (this[key] as any).id } };     
                }                       
                              
                continue;
            }            

            if (!this.isDbVariable(key)) {
                continue;
            }            

            if (this.hasOwnProperty(key) && !((this as any).constructor._BANNED_KEYS || Model._BANNED_KEYS).includes(key) && !timeSeriesHydrationFields.includes(key)) {
                data[key] = this[key];
            }

            if (timeSeriesIds[key]) {
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

    static getModelAnnotations<T extends object>(constructor: new () => T): Record<string, { annotationType: string, metadata: any }> {
        const annotationsData: Record<string, { annotationType: string, metadata: any }> = {};

        const propertyKeys: string[] = Reflect.getMetadataKeys(constructor.prototype).map((item: string): string => {
            return item.split(':')[1];
        });

        propertyKeys.forEach(key => {
            if (String(key) == 'id') {
                return;
            }

            const annotations: string[] = ['TrackType', 'Relation', 'InverseRelation', 'InverseTimeSeries'];

           

            annotations.forEach(annotation => {
                const metadataKey = `${annotation}:${String(key)}`;

                const meta = Reflect.getMetadata(metadataKey, constructor.prototype);
             
                if (meta) {                    
                    annotationsData[String(key)] = { annotationType: annotation, metadata: meta };
                }
            });
        });

        return annotationsData;
    }

    public preUpdate(): void {
        return;
    }

    public postUpdate(): void {
        return;
    }

    public preCreate(): void {
        return;
    }

    public postCreate(): void {
        return;
    }

    public static isSubclass<T extends Model<T>, C extends new () => T>(constructor: C, baseClass: new () => T): boolean {
        return baseClass.prototype.isPrototypeOf(constructor.prototype);
    }

    hasTimeSeries(): boolean {
        return Model.checkTimeSeries((this as any).constructor);
    }

    static checkTimeSeries(constructor: any): boolean {
        const data = constructor.prototype as any;

        for (const key in data) {

            if (data.hasOwnProperty(key)) {

                if (Reflect.getMetadata(`InverseTimeSeries:${key}`, constructor.prototype)) {
                    return true;
                }
            }
        }

        return false;
    }

    isDbVariable(variable: string): boolean {
        return Model.checkDbVariable((this as any).constructor, variable);
    }

    isRelationVariable(variable: string): boolean {
        return Model.checkDbVariable((this as any).constructor, variable, ['Relation']);
    }

    static isRelationVariable(variable: string): boolean {
        return Model.checkDbVariable((this as any).constructor, variable, ['Relation']);
    }

    getRelationData(key: string): any
    {        
        return Model.getRelationData((this as any).constructor, key);
    }

    static getRelationData(object: any, key: string): any
    {
        const dbAnnotations = Model.getModelAnnotations(object);
        return dbAnnotations[key] ? dbAnnotations[key].metadata : null;
    }

    static checkDbVariable(constructor: any, variable: string, decoratorTypes: string[] = ['TrackType']): boolean {

        if (variable === 'id' && decoratorTypes.length === 1 && decoratorTypes[0] === 'TrackType') {
            return true;
        }

        const dbAnnotations = Model.getModelAnnotations(constructor);

        const dbProperties: string[] = Object
            .keys(dbAnnotations)
            .map((key: string): AnnotationType => { 
                return { ...dbAnnotations[key], key }; 
            })
            .filter((element: AnnotationType) => decoratorTypes.includes(element.annotationType))
            .map((element: AnnotationType) => element.key);

        return dbProperties.includes(variable);
    }

    sanitizeDBData(data: any): any {
        const dataKeys = Object.keys(data);
        const sanitizedData: { [key: string]: any } = {};

        for (const key of dataKeys) {
            if (this.isDbVariable(key)) {
                sanitizedData[key] = data[key];
            }
        }

        return sanitizedData;
    }

    public static async watchCollection<ChildClass extends Model<ChildClass>>(
        this: OpModelType<ChildClass>,
        preRun: () => void
    ) {
        const collection = Reflect.get(this, '_collection');
        this.checkForInclusionWithThrow(this.name);
        return await DBService.watchCollection(collection, preRun);
    }

    static getIncludes(): {[key: string]: boolean}
    {        
        return this._RELATIONS;
    }

    public static async findOneBy<ChildClass extends Model<ChildClass>>(
        this: OpModelType<ChildClass>,
        conditions: {
            [fieldName: string]: any
        },
        fields: string[] | null = null,
        ordering: { [fieldName: string]: string } = null,
    ): Promise<ChildClass | null> {
        this.checkForInclusionWithThrow('');

        

        const collection = Reflect.get(this, '_collection');
        const dbData = await DBService.findOneBy(collection, conditions, fields, ordering, this.getIncludes());


        if (dbData) {
            const inst: ChildClass = new (this as { new(): ChildClass })();
            return await inst._asyncFill(dbData);
        }

        return null;
    }

    public static async find<ChildClass extends Model<ChildClass>>(
        this: OpModelType<ChildClass>,
        id: string,
        fields: string[] | null = null,
        ordering: { [fieldName: string]: string } = null
    ): Promise<ChildClass | null> {
        const collection = Reflect.get(this, '_collection');
        this.checkForInclusionWithThrow(this.name);

        const dbData = await DBService.findOneBy(collection, { id }, fields, ordering, this.getIncludes());

        if (dbData) {
            const inst: ChildClass = new (this as { new(): ChildClass })();
            return await inst._asyncFill(dbData);
        }

        return null;
    }

    public static async findAll<ChildClass extends Model<ChildClass>>(
        this: OpModelType<ChildClass>,
        fields: string[] | null = null,
        ordering: { [fieldName: string]: string } = null
    ): Promise<ChildClass[]> {
        const collection = Reflect.get(this, '_collection');
        this.checkForInclusionWithThrow(this.name);

        const dbData: any[] = await DBService.findBy(collection, {}, fields, ordering, this.getIncludes());

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

    public static async delete<ChildClass extends Model<ChildClass>>(
        this: OpModelType<ChildClass>,
        conditions: any
    ): Promise<void> {
        const collection = Reflect.get(this, '_collection');
        this.checkForInclusionWithThrow(this.name);
        return await DBService.delete(collection, conditions);
    }

    public async delete<ChildClass extends Model<ChildClass>>(): Promise<void> {
        const collection = Reflect.get(this, '_collection');
        this.checkForInclusionWithThrow();
        return await DBService.delete(collection, {
            id: this.id
        });
    }

    public static async findBy<ChildClass extends Model<ChildClass>>(
        this: OpModelType<ChildClass>,
        conditions: any,
        fields: string[] | null = null,
        ordering: { [fieldName: string]: string } = null
    ): Promise<ChildClass[]> {
        const collection = Reflect.get(this, '_collection');
        this.checkForInclusionWithThrow(this.name);
        try {            
            const dbData = await DBService.findBy(collection, conditions, fields, ordering, this.getIncludes());

            if (dbData.length) {
                const instanced: ChildClass[] = [];

                for (const data of dbData) {
                    const inst: ChildClass = new (this as { new(): ChildClass })();
                    instanced.push((await inst._asyncFill(data)) as ChildClass);
                }

                return instanced;
            }

            return [];
        } catch (error: Error | any) {
            const rwsError = new Error500(error);

            rwsError.printFullError();

            throw new Error('findBy error ocurred');
        }
    }


    static async create<T extends Model<T>, Data = unknown>(this: new () => T, data: Data): Promise<T> {
        const newModel = new this();

        const sanitizedData = newModel.sanitizeDBData(data);

        await newModel._asyncFill(sanitizedData);

        return newModel;
    }

    static loadModels(): { [key: string]: Model<any> } {
        const AppConfigService = getAppConfig();


        return AppConfigService.get('user_models');
    }

    loadModels(): { [key: string]: Model<any> } {
        return Model.loadModels();
    }
}



export default Model;
export { IModel, TrackType, IMetaOpts, OpModelType };