import 'reflect-metadata';
interface IRelationOpts {
    required?: boolean;
    relationField?: string;
    relatedToField?: string;
    relatedTo?: string;
    inversionModel?: string;
}
declare function Relation(relatedTo: string, required?: boolean, relationField?: string, relatedToField?: string): (target: any, key: string) => void;
export default Relation;
export { IRelationOpts };
