import TestHelper, {ITestVars} from '../helpers/TestHelper';

export default abstract class TestCase
{    
    protected constructor(){  
        throw new Error('Class not instantiable');  
    }

    static declare(testVars: ITestVars): void {
        throw new Error('Method not implemented.');    
    }
}