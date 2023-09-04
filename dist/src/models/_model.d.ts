import TrackType, { IMetaOpts } from "./annotations/TrackType";
interface IModel {
    [key: string]: any;
    id: string | null;
    save: () => void;
    getCollection: () => string | null;
}
declare class Model<ChildClass> implements IModel {
    [key: string]: any;
    id: string;
    static _collection: string;
    static _BANNED_KEYS: string[];
    constructor(data?: any);
    protected _fill(data: any): Model<ChildClass>;
    _asyncFill(data: any): Promise<ChildClass>;
    private getTimeSeriesModelFields;
    toMongo(): any;
    getCollection(): string | null;
    static getCollection(): string | null;
    save(): Promise<this>;
    static getModelAnnotations<T extends object>(constructor: new () => T): Record<string, {
        annotationType: string;
        metadata: any;
    }>;
    preUpdate(): void;
    postUpdate(): void;
    preCreate(): void;
    postCreate(): void;
    static isSubclass<T extends Model<T>, C extends new () => T>(constructor: C, baseClass: new () => T): boolean;
    hasTimeSeries(): boolean;
    static checkTimeSeries(constructor: any): boolean;
    static watchCollection<ChildClass extends Model<ChildClass>>(this: {
        new (): ChildClass;
        _collection: string;
    }, preRun: () => void): Promise<any>;
    static findOneBy<ChildClass extends Model<ChildClass>>(this: {
        new (): ChildClass;
        _collection: string;
    }, conditions: any): Promise<ChildClass | null>;
    static delete<ChildClass extends Model<ChildClass>>(this: {
        new (): ChildClass;
        _collection: string;
    }, conditions: any): Promise<void>;
    delete<ChildClass extends Model<ChildClass>>(): Promise<void>;
    static findBy<ChildClass extends Model<ChildClass>>(this: {
        new (): ChildClass;
        _collection: string;
    }, conditions: any): Promise<ChildClass[]>;
    static create<T extends Model<T>>(this: new () => T, data: any): Promise<T>;
    private loadModels;
}
export default Model;
export { IModel, TrackType, IMetaOpts };
