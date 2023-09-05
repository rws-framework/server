import { exec } from 'child_process';
import { Callback, Context } from 'aws-lambda';

const runModule = (name) => {
  const binPath = '/mnt/efs/node_modules/.bin';
  return `${binPath}/${name}`;
}

export const handler = (event, context, callback) => {
  exec(`${runModule(artillery)} run artillery-config.yml`, (error, stdout, stderr) => {
    if (error) {
      callback(error);
    } else if (stderr) {
      callback(new Error(stderr));
    } else {
      callback(null, stdout);
    }
  });
};