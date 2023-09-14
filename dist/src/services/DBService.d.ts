import { Collection } from 'mongodb';
import ITimeSeries from "../models/interfaces/ITimeSeries";
import { IModel } from "../models/_model";
import TheService from "./_service";
interface IDBClientCreate {
    dbUrl?: string;
    dbName?: string;
}
declare class DBService extends TheService {
    private client;
    private opts;
    private connected;
    constructor(opts?: IDBClientCreate);
    private connectToDB;
    private createBaseMongoClient;
    private createBaseMongoClientDB;
    cloneDatabase(source: string, target: string): Promise<void>;
    watchCollection(collectionName: string, preRun: () => void): Promise<any>;
    insert(data: any, collection: string, isTimeSeries?: boolean): Promise<any>;
    update(data: any, collection: string): Promise<IModel>;
    findOneBy(collection: string, conditions: any): Promise<IModel | null>;
    delete(collection: string, conditions: any): Promise<void>;
    findBy(collection: string, conditions: any): Promise<IModel[]>;
    collectionExists(collection_name: string): Promise<boolean>;
    createTimeSeriesCollection(collection_name: string): Promise<Collection<ITimeSeries>>;
    private getCollectionHandler;
}
declare const _default: DBService;
export default _default;
export { DBService };
