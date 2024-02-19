import { PrismaClient } from '@prisma/client';
import { Collection, Db, MongoClient } from 'mongodb';
import ITimeSeries from '../models/interfaces/ITimeSeries';
import { IModel } from '../models/_model';
import getConfig from './AppConfigService';
import TheService from './_service';
import ConsoleService from './ConsoleService';

interface IDBClientCreate {
  dbUrl?: string;
  dbName?: string;
}

class DBService extends TheService {
    private client: PrismaClient;
    private opts:IDBClientCreate = null;
    private connected = false;

    constructor(opts: IDBClientCreate = null){
        super();   
    }

    private connectToDB(opts: IDBClientCreate = null) {
        if(opts){
            this.opts = opts;
        }else{
            this.opts = {
                dbUrl: getConfig().get('mongo_url'),        
                dbName: getConfig().get('mongo_db'),
            };
        }

        if(!this.opts.dbUrl){
            return;
        }    
  
        try{
            this.client = new PrismaClient({ 
                datasources: {
                    db: {
                        url: this.opts.dbUrl
                    },
                },
            });     

            this.connected = true;
        } catch (e){
            ConsoleService.error('PRISMA CONNECTION ERROR');
        }
    }

    private async createBaseMongoClient(): Promise<MongoClient>
    {
        const dbUrl = this.opts?.dbUrl || getConfig().get('mongo_url');
        const client = new MongoClient(dbUrl);
    
        await client.connect();

        return client;

    }

    private async createBaseMongoClientDB(): Promise<Db>
    {
        const dbName = this.opts?.dbName || getConfig().get('mongo_db');
        const client = await this. createBaseMongoClient();
        return client.db(dbName);
    }

    public async cloneDatabase(source: string, target: string): Promise<void> {
        const client = await this.createBaseMongoClient();

        // Source and target DB
        const sourceDb = client.db(source);
        const targetDb = client.db(target);

        // Get all collections from source DB
        const collections = await sourceDb.listCollections().toArray();

        // Loop over all collections and copy them to the target DB
        for (const collection of collections) {
            const docs = await sourceDb.collection(collection.name).find({}).toArray();
            await targetDb.collection(collection.name).insertMany(docs);
        }

        await client.close();
    }

    async watchCollection(collectionName: string, preRun: () => void): Promise<any>
    {    
        const db = await this.createBaseMongoClientDB();
        const collection = db.collection(collectionName);

        const changeStream = collection.watch();    
        return new Promise((resolve) => {      
            changeStream.on('change', (change) => {           
                resolve(change);
            });

            preRun();
        });   
    }

    async insert(data: any, collection: string, isTimeSeries: boolean = false) {
    
        let result: any = data;
        // Insert time-series data outside of the transaction

        if(isTimeSeries){
            const db = await this.createBaseMongoClientDB();
            const collectionHandler = db.collection(collection);
      
            const insert = await collectionHandler.insertOne(data);

            result = await this.findOneBy(collection, { id: insert.insertedId.toString()  });
            return result;
        }

        const prismaCollection = this.getCollectionHandler(collection);    

        result = await prismaCollection.create({ data });

        return await this.findOneBy(collection, { id: result.id });
    }

    async update(data: any, collection: string): Promise<IModel> 
    {
        const model_id: string = data.id;    
        delete data['id'];

        const prismaCollection = this.getCollectionHandler(collection);

        await prismaCollection.update({
            where: {
                id: model_id,
            },
            data: data,
        });    

        return await this.findOneBy(collection, { id: model_id });
    }
  

    async findOneBy(collection: string, conditions: any): Promise<IModel|null>
    {    
        return await this.getCollectionHandler(collection).findFirst({ where: conditions });
    }

    async delete(collection: string, conditions: any): Promise<void>
    {    
        await this.getCollectionHandler(collection).deleteMany({ where: conditions });
        return;
    }

    async findBy(collection: string, conditions: any, fields: string[] | null = null): Promise<IModel[]>
    {    
        const params: any ={ where: conditions };

        if(fields){
            params.select = {};
            fields.forEach((fieldName: string) => {        
                params.select[fieldName] = true;
            });    
        }

        return await this.getCollectionHandler(collection).findMany(params);
    }

    async collectionExists(collection_name: string): Promise<boolean>
    {
        const dbUrl = this.opts?.dbUrl || getConfig().get('mongo_url');
        const client = new MongoClient(dbUrl);

        try {
            await client.connect();    

            const db = client.db('junctioned'); // Replace with your database name

            const collections = await db.listCollections().toArray();
            const existingCollectionNames = collections.map((collection) => collection.name);

            return existingCollectionNames.includes(collection_name);
        } catch (error) {
            ConsoleService.error('Error connecting to MongoDB:', error);

            throw error;
        }    
    }

    async createTimeSeriesCollection(collection_name: string): Promise<Collection<ITimeSeries>>
    {    
        try {    
            const db = await this.createBaseMongoClientDB();

            // Create a time series collection
            const options = {
                timeseries: {
                    timeField: 'timestamp', // Replace with your timestamp field
                    metaField: 'params' // Replace with your metadata field
                }
            };

            await db.createCollection(collection_name, options); // Replace with your collection name

            return db.collection(collection_name);

        } catch (error) {
            ConsoleService.error('Error connecting to MongoDB:', error);

            throw error;
        }
    }

    private getCollectionHandler(collection: string): any 
    {    
        if(!this.client || !this.connected){
            this.connectToDB();
        }

        return (this.client[collection as keyof PrismaClient] as any);
    }
}

export default DBService.getSingleton();
export { DBService };