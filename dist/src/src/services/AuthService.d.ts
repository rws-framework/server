import TheService from "./_service";
/**
 * @notExported
 */
declare class AuthService extends TheService {
    constructor();
    authorize<IUser>(token: string, constructor: new (data: any) => IUser): Promise<IUser>;
}
declare const _default: AuthService;
export default _default;
