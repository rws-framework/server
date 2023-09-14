import { runShellParallel, runModule, chmod } from './tools.js';
import fs from 'fs';
const ArtilleryDirectory = '/mnt/efs/res/modules/artillery';

export const handler = async (event, context) => {
  if (fs.existsSync(ArtilleryDirectory)) {
    console.log('Starting chmod')
    chmod(ArtilleryDirectory);

    console.log('Starting artillery')
    await runShellParallel(`${runModule('artillery', 'artillery')} run artillery-config.yml`, context);
    return { success: true }
  }else{
    return { success: false, error: 'NO ACCESS TO EFS MODULES' }
  }
  
};