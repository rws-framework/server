import { runShellParallel, runShell, runModule, chmod } from './tools.js';
import fs from 'fs';

const ArtilleryDirectory = '/mnt/efs/res/modules/artillery';
const configFile = 'artillery-config.yml';
const artilleryExecutable = `${ArtilleryDirectory}/.bin/artillery`;

export const handler = async (event, context) => {

  process.env.NODE_PATH = ArtilleryDirectory;

  if (fs.existsSync(ArtilleryDirectory)) {
    await runShell(`ls ${ArtilleryDirectory}/artillery`);
    console.log('Starting artillery')    

    await runShellParallel(`${artilleryExecutable} run ${configFile}`, context, ArtilleryDirectory + '/.bin');
    return { success: true }
  }else{
    return { success: false, error: 'NO ACCESS TO EFS MODULES' }
  }
  
};