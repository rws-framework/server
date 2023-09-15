import 'reflect-metadata';
interface ITrackerOpts {
    required?: boolean;
    relationField?: string;
    relatedToField?: string;
    relatedTo?: string;
    inversionModel?: string;
}
interface IMetaOpts extends ITrackerOpts {
    type: any;
    tags: string[];
}
declare function TrackType(type: any, opts?: ITrackerOpts, tags?: string[]): (target: any, key: string) => void;
export default TrackType;
export { IMetaOpts, ITrackerOpts };
