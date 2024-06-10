import Model from "../models/_model";

export default interface IDbUser {    
    mongoId: string
    loadDbUser: () => Promise<Model<any>>
    db: Model<any>;    
}