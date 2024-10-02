const { rwsPath } = require('@rws-framework/console');
const path = require('path');
const fs = require('fs');

function findRWSWorkDir(type = 'backend', searchFromDir = null){
    const dep = type === 'backend' ? '@rws-framework/server' : '@rws-framework/client';
    const workspaces = rwsPath.getActiveWorkSpaces(searchFromDir ? searchFromDir : process.cwd());
  
    for (const workspace of workspaces){
      const workspaceJson = JSON.parse(fs.readFileSync(path.resolve(workspace, 'package.json')));
      const packages = Object.keys(workspaceJson.dependencies);
  
      if(packages.includes(dep)){
        return workspace;
      }
    }
  
    return null;
}

module.exports = {
    findRWSWorkDir
}