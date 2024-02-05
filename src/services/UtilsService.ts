import TheService from "./_service";
import fs from 'fs';
import path from 'path';

import { SourceMapConsumer, RawSourceMap  } from 'source-map';

class UtilsService extends TheService {  
  private _startTime: [number, number];

  startExecTimeRecord()
  {
    this._startTime = process.hrtime();
  }

  endExecTimeRecord(): number
  {

    if(this._startTime === null){
      return 0;
    }

    const elapsed = process.hrtime(this._startTime);   
    
    this._startTime = null;

    return Math.round(elapsed[0] * 1000 + elapsed[1] / 1e6);
  }

  filterNonEmpty<T>(arr: T[]): T[]
  {
    return arr.filter((argElement: T) => argElement !== '' && typeof argElement !== 'undefined' && argElement !== null);
  }

  isInterface<T>(func: any): func is T {
    return typeof func === 'function';
  }

  getRWSVar(fileName: string): string | null
  {
    const packageDir = this.findRootWorkspacePath(process.cwd());    
    const moduleCfgDir = `${packageDir}/node_modules/.rws`;

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
    const packageDir = this.findRootWorkspacePath(process.cwd());    
    const moduleCfgDir = `${packageDir}/node_modules/.rws`;

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

  async getCurrentLineNumber(error: Error = null): Promise<number> {
    if(!error){
      error = new Error();
    }
    const stack = error.stack || '';
    const stackLines = stack.split('\n');
    const relevantLine = stackLines[1];

    // Extract file path from the stack line
    const match = relevantLine.match(/\((.*?):\d+:\d+\)/);
    if (!match) return -1;
    const filePath = match[1];

    // Assuming the source map is in the same directory with '.map' extension
    const sourceMapPath = `${filePath}.map`;    

    // Read the source map
    const sourceMapContent = fs.readFileSync(sourceMapPath, 'utf-8');    
    const sourceMap: RawSourceMap = JSON.parse(sourceMapContent);
    const consumer = await new SourceMapConsumer(sourceMap);

    // Extract line and column number
    const lineMatch = relevantLine.match(/:(\d+):(\d+)/);
    if (!lineMatch) return -1;

    const originalPosition = consumer.originalPositionFor({
        line: parseInt(lineMatch[1]),
        column: parseInt(lineMatch[2]),
    });

    return originalPosition.line;
  }
}

export default UtilsService.getSingleton();