const { exec } = require('child_process');

const runModule = (name) => {
  const binPath = '/mnt/efs/node_modules/.bin';
  return `${binPath}/${name}`;
}

exports.handler = async (event, context, callback = null) => {
  exec(`${runModule('artillery')} run artillery-config.yml`, (error, stdout, stderr) => {
    if (error) {
      callback(error);
    } else if (stderr) {
      callback(new Error(stderr));
    } else {
      callback(null, stdout);
    }
  });
};