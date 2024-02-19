import puppeteer, {Browser, Protocol } from 'puppeteer';

interface IBrowserParams {
    url: string
}

class WebBrowser {
    private app: Browser;
    private params: IBrowserParams;

    constructor(app: Browser, params: IBrowserParams) {
        this.app = app;
        this.params = params;    
    }

    async getCookies(): Promise<{[key: string]: Protocol.Network.Cookie}>
    {        
        const page = await this.app.newPage();
        await page.goto(this.params.url);
    
        // Get cookies
        const cookiesArray  = await page.cookies();        
    
        await this.app.close();

        return cookiesArray.reduce((acc: { [key: string]: Protocol.Network.Cookie }, cookie: Protocol.Network.Cookie) => {
            acc[cookie.name] = cookie;
            return acc;
        }, {});
    }

    async getCookieString(): Promise<string>
    {        
        return Object.entries(await this.getCookies())
            .map(([name, cookie]) => `${name}=${cookie.value}`)
            .join('; ');
    }
}

async function create(params: IBrowserParams): Promise<WebBrowser>
{
    const browser = await puppeteer.launch({
        headless: 'new',
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
        ignoreHTTPSErrors: true, 
    });

    return new WebBrowser(browser, params);
}

export default {
    create,  
};

export { IBrowserParams, WebBrowser };