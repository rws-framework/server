import { ITestVars } from "../helpers/TestHelper";
export default abstract class TestCase {
    protected constructor();
    static declare(testVars: ITestVars): void;
}
