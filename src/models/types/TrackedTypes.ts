export type TrackedRWSTypes<T = Object> = String | Object | Array<T> | Number | Date;
export interface ITrackerOpts{
    required?: boolean,
    relationField?: string
    relatedToField?: string,
    relatedTo?: string,
    inversionModel?: string,
    subType?: TrackedRWSTypes
  }
  
export interface IMetaOpts extends ITrackerOpts{
    type: any,
    tags: string[]
}