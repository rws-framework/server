import TheService from './_service';

import path from 'path';
import fs from 'fs';


class TraversalService extends TheService {
    getAllFilesInFolder(folderPath: string, ignoreFilenames: string[] = [], recursive: boolean = false): string[] 
    {
        const files: string[] = [];
  
        function traverseDirectory(currentPath: string): void 
        {
            const entries = fs.readdirSync(currentPath, { withFileTypes: true });
  
            entries.forEach(entry => {
                const entryPath = path.join(currentPath, entry.name);
  
                if (entry.isFile()) {
                    if(!ignoreFilenames.includes(entryPath)){
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

export default TraversalService.getSingleton();
export {TraversalService};