export abstract class Helper {    
    constructor() {
        throw new Error(`${this.constructor.name} is a helper class and cannot be instantiated`);
    }

}