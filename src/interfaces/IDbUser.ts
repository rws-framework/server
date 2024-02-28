import Model from "../models/_model";

export default interface IDbUser {    
    mongoId: string
    loadDbUser: () => Promise<void>
    db: Model<any>;    
}