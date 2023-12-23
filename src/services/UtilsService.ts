import TheService from "./_service";
import fs from 'fs';
import path from 'path';
//@ts-ignore
import utils from '../../_tools';

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

    if(!fs.existsSync(`${moduleCfgDir}/${fileName}`)){
      return;
    }

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

    if(!fs.existsSync(moduleCfgDir)){
      fs.mkdirSync(moduleCfgDir);
    }

    fs.writeFileSync(`${moduleCfgDir}/${fileName}`, value);
  }

  findRootWorkspacePath(currentPath: string): string
  {  
    const parentPackageJsonPath = path.join(currentPath + '/..', 'package.json');        
    const parentPackageDir = path.dirname(parentPackageJsonPath);

    if (fs.existsSync(parentPackageJsonPath)) {
      const packageJson = JSON.parse(fs.readFileSync(parentPackageJsonPath, 'utf-8'));

      if (packageJson.workspaces) {
        return this.findRootWorkspacePath(parentPackageDir);
      }
    }

    return currentPath;
  }
}

export default UtilsService.getSingleton();