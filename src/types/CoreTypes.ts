import { OpModelType } from "@rws-framework/db";

export interface IKDBTypeInfo {
    fieldName: string;
    type: string;
    boundModel?: OpModelType<any>
}

export interface IKDBTypesResponse {
    success: boolean;
    data: {
        types: IKDBTypeInfo[];
    };
}