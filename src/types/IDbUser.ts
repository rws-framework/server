import Model from "../models/_model";

export default interface IDbUser {    
    id: string
    username: string
    passwd: string
    created_at: Date
    updated_at: Date
}