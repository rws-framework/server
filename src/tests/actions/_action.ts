import {ITestVars} from "../helpers/TestHelper";

export default abstract class TestAction
{
    protected vars!: ITestVars;

    constructor(vars: ITestVars){
        this.vars = vars;
    }

    abstract fire(noReturn: boolean): Promise<any>;
}