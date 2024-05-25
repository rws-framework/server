import path from 'path';
import fs from 'fs';
import { Injectable } from '@rws-framework/server/nest';  

@Injectable()
class TraversalService {
    getAllFilesInFolder(folderPath: string, ignoreFilenames: RegExp[] = [], recursive: boolean = false): string[] 
    {
        const files: string[] = [];
  
        function traverseDirectory(currentPath: string): void 
        {
            const entries = fs.readdirSync(currentPath, { withFileTypes: true });
  
            entries.forEach(entry => {
                const entryPath = path.join(currentPath, entry.name);
  
                if (entry.isFile()) {
                    let pass = true;

                    ignoreFilenames.forEach((regEx: RegExp) => {                        
                        if(regEx.test(entryPath)){
                            pass = false;
                        }
                    })

                    if(pass){
                        files.push(entryPath);
                    }            
                } else if (entry.isDirectory() && recursive) {
                    traverseDirectory(entryPath);
                }
            });
        }
  
        traverseDirectory(folderPath);

        return files;
    }
}

export {TraversalService};