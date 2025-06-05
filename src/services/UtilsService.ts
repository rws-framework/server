import TheService from './_service';
import fs from 'fs';
import path from 'path';
import { rwsPath } from '@rws-framework/console';
import { Injectable } from '../../nest';  

import { SourceMapConsumer, RawSourceMap  } from 'source-map';

@Injectable()
class UtilsService {  
    private _startTime: [number, number];

    findRootWorkspacePath = rwsPath.findRootWorkspacePath;
    findPackageDir = rwsPath.findPackageDir;

    startExecTimeRecord()
    {
        this._startTime = process.hrtime() ;
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

    static getRWSVar(fileName: string): string | null
    {
        const packageDir = rwsPath.findRootWorkspacePath(process.cwd());    
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
  
    static setRWSVar(fileName: string, value: string)
    {
        const packageDir = rwsPath.findRootWorkspacePath(process.cwd());    
        const moduleCfgDir = `${packageDir}/node_modules/.rws`;

        if(!fs.existsSync(moduleCfgDir)){
            fs.mkdirSync(moduleCfgDir);
        }

        if(fileName.indexOf('/') > -1){
            const parts = fileName.split('/');
            const file = parts.pop(); // Ostatni element to nazwa pliku
            const dirPath = `${moduleCfgDir}/${parts.join('/')}`; 
    
            // Tworzymy wszystkie katalogi rekursywnie
            fs.mkdirSync(dirPath, { recursive: true });
        }

        fs.writeFileSync(`${moduleCfgDir}/${fileName}`, value);
    }

    getRWSVar(fileName: string): string | null
    {
        return UtilsService.getRWSVar(fileName);
    }   
  
    setRWSVar(fileName: string, value: string)
    {
        UtilsService.setRWSVar(fileName, value);
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

    detectPackageManager(): 'yarn' | 'npm'
    {
        // Sprawdzamy czy jest yarn.lock
        const hasYarnLock = fs.existsSync(path.join(process.cwd(), 'yarn.lock'));
        
        // Sprawdzamy zmienne środowiskowe
        const npmExecPath = process.env.npm_execpath || '';
        const isYarnPath = npmExecPath.includes('yarn');
        
        // Sprawdzamy czy proces został uruchomiony przez yarn
        const isYarnEnv = process.env.npm_config_user_agent?.includes('yarn');
    
        return (hasYarnLock || isYarnPath || isYarnEnv) ? 'yarn' : 'npm';
    }
}

export {UtilsService};