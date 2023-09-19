import { runShellParallel, runShell, runModule, chmod } from './tools.js';
import fs from 'fs';

const ArtilleryDirectory = '/mnt/efs/res/modules/artillery';
const configFile = 'artillery-config.yml';

export const handler = async (event, context) => {
  if (fs.existsSync(ArtilleryDirectory)) {
    // await runShell(command);
    console.log('Starting artillery')
    await runShell(command);

    await runShellParallel(`npx artillery run ${configFile}`, context);
    return { success: true }
  }else{
    return { success: false, error: 'NO ACCESS TO EFS MODULES' }
  }
  
};