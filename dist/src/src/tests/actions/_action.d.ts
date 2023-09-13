import { ITestVars } from "../helpers/TestHelper";
export default abstract class TestAction {
    protected vars: ITestVars;
    constructor(vars: ITestVars);
    abstract fire(noReturn: boolean): Promise<any>;
}
