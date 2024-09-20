export default interface IDbUser<T = any> {    
    mongoId: string
    loadDbUser: () => Promise<T>
    db: T;    
}