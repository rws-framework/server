import { ConfigService as AppConfigService } from "@nestjs/config";
import { DBService } from "../../services/DBService";
import Model from "../_model";

export interface IModel{
    [key: string]: any;
    id: string | null;
    save: () => void;
    getCollection: () => string | null;    
    configService?: AppConfigService;
    dbService?: DBService;
}

export type DBModelFindOneType<ChildClass> = (
    this: OpModelType<ChildClass>,
    conditions: any,
    fields?: string[],
    ordering?: { [fieldName: string]: string }
) => Promise<ChildClass | null>;

export type DBModelFindManyType<ChildClass> = (
    this: OpModelType<ChildClass>,
    conditions: any,
    fields?: string[],
    ordering?: { [fieldName: string]: string }
) => Promise<ChildClass | null>;

export interface OpModelType<ChildClass> {
    new(data?: any | null): ChildClass;
    name: string 
    _collection: string;
    loadModels: () => Model<any>[];
    getIncludes: () => {[key: string]: boolean};
    injectDBService: (dbService: DBService) => void,
    checkForInclusionWithThrow: (className: string) => void;
    checkForInclusion: (className: string) => boolean;
    configService?: AppConfigService;
    dbService?: DBService;
    findAll: any;
    findBy: any;
    find: any;
}