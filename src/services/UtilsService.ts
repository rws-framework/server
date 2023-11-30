import TheService from "./_service";
import fs from 'fs';

class UtilsService extends TheService {
  filterNonEmpty<T>(arr: T[]): T[]
  {
    return arr.filter((argElement: T) => argElement !== '' && typeof argElement !== 'undefined' && argElement !== null);
  }

  isInterface<T>(func: any): func is T {
    return typeof func === 'function';
  }

  getRWSVar(fileName: string): string | null
  {
    const executionDir = process.cwd();    
    const moduleCfgDir = `${executionDir}/node_modules/.rws`;

    try{
      return fs.readFileSync(`${moduleCfgDir}/${fileName}`, 'utf-8');
    } catch (e: any){
      return null;
    }
  }   
  
  setRWSVar(fileName: string, value: string)
  {
    const executionDir = process.cwd();    
    const moduleCfgDir = `${executionDir}/node_modules/.rws`;

    fs.writeFileSync(`${moduleCfgDir}/${fileName}`, value);
  }

}

export default UtilsService.getSingleton();