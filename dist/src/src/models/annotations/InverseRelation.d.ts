import 'reflect-metadata';
interface InverseRelationOpts {
    required?: boolean;
    relationField?: string;
    relatedToField?: string;
    relatedTo?: string;
    inversionModel?: string;
}
declare function InverseRelation(inversionModel: string): (target: any, key: string) => void;
export default InverseRelation;
export { InverseRelationOpts };
