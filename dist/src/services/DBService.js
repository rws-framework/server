"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DBService = void 0;
const client_1 = require("@prisma/client");
const mongodb_1 = require("mongodb");
const AppConfigService_1 = __importDefault(require("./AppConfigService"));
const _service_1 = __importDefault(require("./_service"));
const ConsoleService_1 = __importDefault(require("./ConsoleService"));
class DBService extends _service_1.default {
    constructor(opts = null) {
        super();
        this.opts = null;
        this.connected = false;
    }
    connectToDB(opts = null) {
        if (opts) {
            this.opts = opts;
        }
        else {
            this.opts = {
                dbUrl: (0, AppConfigService_1.default)().get('mongo_url'),
                dbName: (0, AppConfigService_1.default)().get('mongo_db'),
            };
        }
        if (!this.opts.dbUrl) {
            return;
        }
        try {
            this.client = new client_1.PrismaClient({
                datasources: {
                    db: {
                        url: this.opts.dbUrl
                    },
                },
            });
            this.connected = true;
        }
        catch (e) {
            ConsoleService_1.default.error('PRISMA CONNECTION ERROR');
        }
    }
    async createBaseMongoClient() {
        var _a;
        const dbUrl = ((_a = this.opts) === null || _a === void 0 ? void 0 : _a.dbUrl) || (0, AppConfigService_1.default)().get('mongo_url');
        const client = new mongodb_1.MongoClient(dbUrl);
        await client.connect();
        return client;
    }
    async createBaseMongoClientDB() {
        var _a;
        const dbName = ((_a = this.opts) === null || _a === void 0 ? void 0 : _a.dbName) || (0, AppConfigService_1.default)().get('mongo_db');
        const client = await this.createBaseMongoClient();
        return client.db(dbName);
    }
    async cloneDatabase(source, target) {
        const client = await this.createBaseMongoClient();
        // Source and target DB
        const sourceDb = client.db(source);
        const targetDb = client.db(target);
        // Get all collections from source DB
        const collections = await sourceDb.listCollections().toArray();
        // Loop over all collections and copy them to the target DB
        for (let collection of collections) {
            const docs = await sourceDb.collection(collection.name).find({}).toArray();
            await targetDb.collection(collection.name).insertMany(docs);
        }
        await client.close();
    }
    async watchCollection(collectionName, preRun) {
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
    async insert(data, collection, isTimeSeries = false) {
        let result = data;
        // Insert time-series data outside of the transaction
        if (isTimeSeries) {
            const db = await this.createBaseMongoClientDB();
            const collectionHandler = db.collection(collection);
            const insert = await collectionHandler.insertOne(data);
            result = await this.findOneBy(collection, { id: insert.insertedId.toString() });
            return result;
        }
        const prismaCollection = this.getCollectionHandler(collection);
        result = await prismaCollection.create({ data });
        return await this.findOneBy(collection, { id: result.id });
    }
    async update(data, collection) {
        const model_id = data.id;
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
    ;
    async findOneBy(collection, conditions) {
        return await this.getCollectionHandler(collection).findFirst({ where: conditions });
    }
    async delete(collection, conditions) {
        await this.getCollectionHandler(collection).deleteMany({ where: conditions });
        return;
    }
    async findBy(collection, conditions, fields = null) {
        const params = { where: conditions };
        if (fields) {
            params.select = {};
            fields.forEach((fieldName) => {
                params.select[fieldName] = true;
            });
        }
        return await this.getCollectionHandler(collection).findMany(params);
    }
    async collectionExists(collection_name) {
        var _a;
        const dbUrl = ((_a = this.opts) === null || _a === void 0 ? void 0 : _a.dbUrl) || (0, AppConfigService_1.default)().get('mongo_url');
        const client = new mongodb_1.MongoClient(dbUrl);
        try {
            await client.connect();
            const db = client.db('junctioned'); // Replace with your database name
            const collections = await db.listCollections().toArray();
            const existingCollectionNames = collections.map((collection) => collection.name);
            return existingCollectionNames.includes(collection_name);
        }
        catch (error) {
            ConsoleService_1.default.error('Error connecting to MongoDB:', error);
            throw error;
        }
    }
    async createTimeSeriesCollection(collection_name) {
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
        }
        catch (error) {
            ConsoleService_1.default.error('Error connecting to MongoDB:', error);
            throw error;
        }
    }
    getCollectionHandler(collection) {
        if (!this.client || !this.connected) {
            this.connectToDB();
        }
        return this.client[collection];
    }
}
exports.DBService = DBService;
exports.default = DBService.getSingleton();
//# sourceMappingURL=DBService.js.map