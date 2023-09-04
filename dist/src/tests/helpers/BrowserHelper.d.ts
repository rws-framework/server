import { Browser, Protocol } from 'puppeteer';
interface IBrowserParams {
    url: string;
}
declare class WebBrowser {
    private app;
    private params;
    constructor(app: Browser, params: IBrowserParams);
    getCookies(): Promise<{
        [key: string]: Protocol.Network.Cookie;
    }>;
    getCookieString(): Promise<string>;
}
declare function create(params: IBrowserParams): Promise<WebBrowser>;
declare const _default: {
    create: typeof create;
};
export default _default;
export { IBrowserParams, WebBrowser };
