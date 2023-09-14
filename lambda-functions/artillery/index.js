import { runShellParallel, runShell, runModule, chmod } from './tools.js';
import fs from 'fs';
const ArtilleryDirectory = '/mnt/efs/res/modules/artillery';

export const handler = async (event, context) => {
  if (fs.existsSync(ArtilleryDirectory)) {
    console.log('Starting chmod')
    chmod(ArtilleryDirectory);

    const artilleryPath = `${ArtilleryDirectory}/artillery/bin/run`;
    const command = `NODE_PATH=${ArtilleryDirectory} ${artilleryPath} ${configPath}`;

    // await runShell(command);
    console.log('Starting artillery')
    await runShellParallel(command, context);
    return { success: true }
  }else{
    return { success: false, error: 'NO ACCESS TO EFS MODULES' }
  }
  
};