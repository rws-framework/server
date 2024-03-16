const path = require('path');
const fs = require('fs');
const { spawn } = require('child_process');

function findRootWorkspacePath(currentPath) {        
  const parentPackageJsonPath = path.join(currentPath + '/..', 'package.json');        
  const parentPackageDir = path.dirname(parentPackageJsonPath);

  if (fs.existsSync(parentPackageJsonPath)) {
    const packageJson = JSON.parse(fs.readFileSync(parentPackageJsonPath, 'utf-8'));

    if (packageJson.workspaces) {
      return findRootWorkspacePath(parentPackageDir);
    }
  }

  return currentPath;
}

function getActiveWorkSpaces(currentPath, mode = 'all') { 
  if(!currentPath){
    throw new Error(`[_tools.js:getActiveWorkSpaces] "currentPath" argument is required.`);
  }

  if(!(['all', 'frontend', 'backend'].includes(mode))){
    throw new Error(`[_tools.js:getActiveWorkSpaces] "mode" argument can be only: "frontend", "backend" or "all".`);
  }

  const rootPkgDir = findRootWorkspacePath(currentPath)
  const parentPackageJsonPath = path.join(rootPkgDir, 'package.json');        
  const parentPackageDir = path.dirname(parentPackageJsonPath);

  if (fs.existsSync(parentPackageJsonPath)) {
    const packageJson = JSON.parse(fs.readFileSync(parentPackageJsonPath, 'utf-8'));

    if (packageJson.workspaces) {
      return packageJson.workspaces.map((workspaceName) => path.join(rootPkgDir, workspaceName)).filter((workspaceDir) => {
        if(mode === 'all'){
          return true;
        }

        let rwsPkgName = '@rws-framework/server';

        if(mode === 'frontend'){
          rwsPkgName = '@rws-framework/client';
        }

        let hasDesiredPackage = false;

        const workspaceWebpackFilePath = path.join(workspaceDir, 'package.json');        
        const workspacePackageJson = JSON.parse(fs.readFileSync(workspaceWebpackFilePath, 'utf-8'));

        if (workspacePackageJson.dependencies && (!!workspacePackageJson.dependencies[rwsPkgName])) {
          hasDesiredPackage = true;
        }

        return hasDesiredPackage;
      });
    }
  }

  return [currentPath];
}

async function runCommand(command, cwd = null, silent = false) {
  return new Promise((resolve, reject) => {
    const [cmd, ...args] = command.split(' ');
    
    if(!cwd){
      console.log(`[RWS] Setting default CWD for "${command}"`);
      cwd = process.cwd();
    }

    console.log(`[RWS] Running command "${command}" from "${cwd}"`);

    const spawned = spawn(cmd, args, { stdio: silent ? 'ignore' : 'inherit', cwd });

    spawned.on('exit', (code) => {
      if (code !== 0) {
        return reject(new Error(`Command failed with exit code ${code}`));
      }
      resolve();
    });

    spawned.on('error', (error) => {
      reject(error);
    });
  });
}

function linkWorkspaces(packageJsonPath, rootDir){
  const package = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));

  package.workspaces.forEach((workspace) => {
      linkWorkspace(workspace, rootDir);
  });
}

function linkWorkspace(workspace, rootDir){  
  if(fs.existsSync(`${rootDir}/${workspace}/node_modules`)){
    removeDirectory(`${rootDir}/${workspace}/node_modules`);
  }

  createAndLogSymlink( `${rootDir}/node_modules`,`${rootDir}/${workspace}/node_modules`);
}

function removeWorkspacePackages(packageJsonPath, rootDir){
  const package = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));

  package.workspaces.forEach((workspace) => {
      if(fs.existsSync(`${rootDir}/${workspace}/node_modules`)){
          removeDirectory(`${rootDir}/${workspace}/node_modules`);
      }      
  });
}

function createAndLogSymlink(symLinkDir, targetDir) {
    // Ensure absolute paths
    const absoluteTarget = path.resolve(symLinkDir);
    const absolutePathForLink = path.resolve(targetDir);
  
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

  if(!fs.existsSync(absoluteDirPath)){
    console.warn(`Directory "${absoluteDirPath}" does not exist.`);
    return;
  }

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
    linkWorkspaces,
    linkWorkspace,
    removeWorkspacePackages,
    runCommand,
    removeDirectory,
    createAndLogSymlink,
    getActiveWorkSpaces
}