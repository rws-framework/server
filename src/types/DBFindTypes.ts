import { OpModelType } from "../models/_model";

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