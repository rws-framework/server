"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebBrowser = void 0;
const puppeteer_1 = __importDefault(require("puppeteer"));
class WebBrowser {
    constructor(app, params) {
        this.app = app;
        this.params = params;
    }
    async getCookies() {
        const page = await this.app.newPage();
        await page.goto(this.params.url);
        // Get cookies
        const cookiesArray = await page.cookies();
        await this.app.close();
        return cookiesArray.reduce((acc, cookie) => {
            acc[cookie.name] = cookie;
            return acc;
        }, {});
    }
    async getCookieString() {
        return Object.entries(await this.getCookies())
            .map(([name, cookie]) => `${name}=${cookie.value}`)
            .join('; ');
    }
}
exports.WebBrowser = WebBrowser;
async function create(params) {
    const browser = await puppeteer_1.default.launch({
        headless: 'new',
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
        ignoreHTTPSErrors: true,
    });
    return new WebBrowser(browser, params);
}
exports.default = {
    create,
};
//# sourceMappingURL=BrowserHelper.js.map