import { exec } from 'child_process';

const runModule = (name) => {
  const binPath = '/mnt/efs/res/node_modules/.bin';
  return `${binPath}/${name}`;
}

export const handler = async (event, context, callback = null) => {
  exec(`${runModule('artillery')} run artillery-config.yml`, (error, stdout, stderr) => {
    if (stdout) {
      console.log('Shell Output:', stdout);
    }
    if (stderr) {
      console.error('Shell Error Output:', stderr);
    }
    if (error) {
      callback(error);
    } else if (stderr) {
      callback(new Error(stderr));
    } else {
      callback(null, stdout);
    }
  });
};
