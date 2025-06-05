const path = require('path');
const keysTransformer = require('ts-transformer-keys/transformer').default;
const TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin');
const RWSWebPackSettings = require('@rws-framework/server/rws.webpack.config');

const config = RWSWebPackSettings({
    dev: true,
    entry: `${process.cwd()}/src/index.ts`,
    outputDir: path.resolve(__dirname, 'build'),
    outputFileName: 'example.server.js',
    resolvePlugins: [
        new TsconfigPathsPlugin({configFile: './tsconfig.json'})
    ]
});

module.exports = config;
