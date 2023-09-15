"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TrackType = void 0;
const rws_js_server_1 = require("rws-js-server");
const TrackType_1 = __importDefault(require("./annotations/TrackType"));
exports.TrackType = TrackType_1.default;
class Model {
    constructor(data) {
        if (!this.getCollection()) {
            throw new Error('Model must have a collection defined');
        }
        if (!data) {
            return;
        }
        if (!this.hasTimeSeries()) {
            this._fill(data);
        }
        else {
            throw new Error('Time Series not supported in synchronous constructor. Use `await Model.create(data)` static method to instantiate this model.');
        }
    }
    _fill(data) {
        for (const key in data) {
            if (data.hasOwnProperty(key)) {
                const meta = Reflect.getMetadata(`InverseTimeSeries:${key}`, this.constructor.prototype);
                if (meta) {
                    data[key] = {
                        create: data[key]
                    };
                }
                else {
                    this[key] = data[key];
                }
            }
        }
        return this;
    }
    async _asyncFill(data) {
        const collections_to_models = {};
        const timeSeriesIds = this.getTimeSeriesModelFields();
        const _self = this;
        this.loadModels().forEach((model) => {
            collections_to_models[model.getCollection()] = model;
        });
        const seriesHydrationfields = [];
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
                }
                else {
                    this[key] = data[key];
                }
            }
        }
        return this;
    }
    getTimeSeriesModelFields() {
        const timeSeriesIds = {};
        for (const key in this) {
            if (this.hasOwnProperty(key)) {
                const meta = Reflect.getMetadata(`InverseTimeSeries:${key}`, this);
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
    toMongo() {
        let data = {};
        const timeSeriesIds = this.getTimeSeriesModelFields();
        const timeSeriesHydrationFields = [];
        for (const key in this) {
            if (this.hasOwnProperty(key) && !(this.constructor._BANNED_KEYS || Model._BANNED_KEYS).includes(key) && !timeSeriesHydrationFields.includes(key)) {
                data[key] = this[key];
            }
            if (!!timeSeriesIds[key]) {
                data[key] = this[key];
                timeSeriesHydrationFields.push(timeSeriesIds[key].hydrationField);
            }
        }
        return data;
    }
    getCollection() {
        return this.constructor._collection || this._collection;
    }
    static getCollection() {
        return this.constructor._collection || this._collection;
    }
    async save() {
        const data = this.toMongo();
        let updatedModelData = data;
        if (this.id) {
            this.preUpdate();
            updatedModelData = await rws_js_server_1.DBService.update(data, this.getCollection());
            await this._asyncFill(updatedModelData);
            this.postUpdate();
        }
        else {
            this.preCreate();
            const timeSeriesModel = await Promise.resolve().then(() => __importStar(require('./types/TimeSeriesModel')));
            const isTimeSeries = this instanceof timeSeriesModel.default;
            updatedModelData = await rws_js_server_1.DBService.insert(data, this.getCollection(), isTimeSeries);
            await this._asyncFill(updatedModelData);
            this.postCreate();
        }
        return this;
    }
    static getModelAnnotations(constructor) {
        const annotationsData = {};
        const propertyKeys = Reflect.getMetadataKeys(constructor.prototype).map((item) => {
            return item.split(':')[1];
        });
        propertyKeys.forEach(key => {
            if (String(key) == 'id') {
                return;
            }
            const annotations = ['TrackType', 'Relation', 'InverseRelation', 'InverseTimeSeries'];
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
    preUpdate() {
        return;
    }
    postUpdate() {
        return;
    }
    preCreate() {
        return;
    }
    postCreate() {
        return;
    }
    static isSubclass(constructor, baseClass) {
        return baseClass.prototype.isPrototypeOf(constructor.prototype);
    }
    hasTimeSeries() {
        return Model.checkTimeSeries(this.constructor);
    }
    static checkTimeSeries(constructor) {
        const data = constructor.prototype;
        for (const key in data) {
            if (data.hasOwnProperty(key)) {
                if (Reflect.getMetadata(`InverseTimeSeries:${key}`, constructor.prototype)) {
                    return true;
                }
            }
        }
        return false;
    }
    static async watchCollection(preRun) {
        const collection = Reflect.get(this, '_collection');
        return await rws_js_server_1.DBService.watchCollection(collection, preRun);
    }
    static async findOneBy(conditions) {
        const collection = Reflect.get(this, '_collection');
        const dbData = await rws_js_server_1.DBService.findOneBy(collection, conditions);
        if (dbData) {
            const inst = new this();
            return await inst._asyncFill(dbData);
        }
        return null;
    }
    static async delete(conditions) {
        const collection = Reflect.get(this, '_collection');
        return await rws_js_server_1.DBService.delete(collection, conditions);
    }
    async delete() {
        const collection = Reflect.get(this, '_collection');
        return await rws_js_server_1.DBService.delete(collection, {
            id: this.id
        });
    }
    static async findBy(conditions) {
        const collection = Reflect.get(this, '_collection');
        const dbData = await rws_js_server_1.DBService.findBy(collection, conditions);
        if (dbData.length) {
            const instanced = [];
            for (const data of dbData) {
                const inst = new this();
                instanced.push((await inst._asyncFill(data)));
            }
            return instanced;
        }
        return [];
    }
    static async create(data) {
        const newModel = new this();
        await newModel._asyncFill(data);
        return newModel;
    }
    loadModels() {
        const AppConfigService = (0, rws_js_server_1.getAppConfig)();
        return AppConfigService.get('user_models');
    }
}
Model._collection = null;
Model._BANNED_KEYS = ['_collection'];
__decorate([
    (0, TrackType_1.default)(String),
    __metadata("design:type", String)
], Model.prototype, "id", void 0);
exports.default = Model;
//# sourceMappingURL=_model.js.map