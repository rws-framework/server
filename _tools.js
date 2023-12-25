const path = require('path');
const fs = require('fs');

function findRootWorkspacePath(currentPath) {        
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

function linkWorkspaces(packageJsonPath, rootDir){
  const package = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));

  package.workspaces.forEach((workspace) => {
      if(fs.existsSync(`${rootDir}/${workspace}/node_modules`)){
          removeDirectory(`${rootDir}/${workspace}/node_modules`);
      }
  
      createAndLogSymlink( `${rootDir}/node_modules`,`${rootDir}/${workspace}/node_modules`);
  });
}

function createAndLogSymlink(target, pathForLink) {
    // Ensure absolute paths
    const absoluteTarget = path.resolve(target);
    const absolutePathForLink = path.resolve(pathForLink);
  
    // Create the symlink
    fs.symlink(absoluteTarget, absolutePathForLink, (err) => {
      if (err) {
        console.error("Error creating symlink:", err);
        return;
      }
  
      // Log success message
      console.log(`Symlink created: ${absolutePathForLink} -> ${absoluteTarget}`);
    });
}

function removeDirectory(dirPath) {
  const absoluteDirPath = path.resolve(dirPath);

  fs.rmSync(absoluteDirPath, { recursive: true, force: true }, (err) => {
    if (err) {
      console.error("Error removing directory:", err);
      return;
    }
    console.log(`Directory removed: ${absoluteDirPath}`);
  });
}

module.exports = {
    findRootWorkspacePath,
    linkWorkspaces
}