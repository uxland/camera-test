const { resolve } = require('path');
const createCommonConfig = require('./webpack.common.js');
const productionConfig = require('./webpack.prod.js');
const developmentConfig = require('./webpack.dev.js');
const pkg = require('./package.json');

// Allow merge different environment settings
const webpackMerge = require('webpack-merge');
const getLogger = require('webpack-log');
const log = getLogger({ name: pkg.name });

const IS_DEV_SERVER = process.argv.find(arg => arg.includes('webpack-dev-server'));
const OUTPUT_PATH = IS_DEV_SERVER ? resolve(__dirname) : resolve('public');
const config = { IS_DEV_SERVER, OUTPUT_PATH };

module.exports = () => {
  // Define environment constant based in NODE_ENV param.
  const ENV = process.argv.find(arg => arg.includes('NODE_ENV=production')) ? 'production' : 'development';

  log.info('Environment:', ENV);
  const envConfig = ENV == 'production' ? productionConfig(config) : developmentConfig(config);
  const commonConfig = createCommonConfig(config);
  //Merge the common config with current environment config.
  return webpackMerge.smart(commonConfig, envConfig);
};
