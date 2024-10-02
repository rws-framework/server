import Model from '../models/_model';

export interface IAuthUserTokenManager { db: Model<any>, loadDbUser: () => Promise<Model<any>> }