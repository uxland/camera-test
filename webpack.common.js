'use strict';
const { resolve, join } = require('path');
const pkg = require('./package.json');
const webpack = require('webpack');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const HtmlWebpackExcludeAssetsPlugin = require('html-webpack-exclude-assets-plugin');
const ScriptExtHtmlWebpackPlugin = require('script-ext-html-webpack-plugin');
// const Dotenv = require('dotenv-webpack');

// const IS_DEV_SERVER = process.argv.find(arg => arg.includes('webpack-dev-server'));
// const OUTPUT_PATH = IS_DEV_SERVER ? resolve(__dirname) : resolve('dist');
const ENV = process.argv.find(arg => arg.includes('NODE_ENV=production')) ? 'production' : 'development';

const processEnv = {
  NODE_ENV: JSON.stringify(ENV),
  appVersion: JSON.stringify(pkg.version)
};

const copyStatics = config => ({
  copyWebcomponents: [
    {
      from: resolve('./node_modules/@webcomponents/webcomponentsjs/webcomponents-loader.js'),
      to: join(config.OUTPUT_PATH, 'vendor'),
      flatten: true
    },
    {
      from: resolve('./node_modules/@webcomponents/webcomponentsjs/webcomponents-bundle.js'),
      to: join(config.OUTPUT_PATH, 'vendor'),
      flatten: true
    },
    {
      from: resolve('./node_modules/@webcomponents/webcomponentsjs/bundles/webcomponents-ce.js'),
      to: join(config.OUTPUT_PATH, 'vendor', 'bundles'),
      flatten: true
    },
    {
      from: resolve('./node_modules/@webcomponents/webcomponentsjs/bundles/webcomponents-sd-ce.js'),
      to: join(config.OUTPUT_PATH, 'vendor', 'bundles'),
      flatten: true
    },
    {
      from: resolve('./node_modules/@webcomponents/webcomponentsjs/bundles/webcomponents-sd-ce-pf.js'),
      to: join(config.OUTPUT_PATH, 'vendor', 'bundles'),
      flatten: true
    },
    {
      from: resolve('./node_modules/@webcomponents/webcomponentsjs/bundles/webcomponents-sd.js'),
      to: join(config.OUTPUT_PATH, 'vendor', 'bundles'),
      flatten: true
    }
  ],
  copyOthers: [
    {
      from: resolve('demo/index.html'),
      to: config.OUTPUT_PATH,
      flatten: true
    },
    {
      from: resolve('demo/settings.js'),
      to: config.OUTPUT_PATH,
      flatten: true
    },
    {
      from: resolve('./images'),
      to: resolve(config.OUTPUT_PATH, 'images'),
      flatten: true
    }
  ]
});

const renderHtmlPlugins = () => [
  new HtmlWebpackPlugin({
    template: `!!ejs-loader!${resolve('demo/index.html')}`,
    minify: ENV == 'production',
    chunksSortMode: 'none',
    inject: true,
    compile: true,
    excludeAssets: [/(bundle|polyfills)(\..*)?\.js$/],
    showErrors: true,
    paths: {
      webcomponents: '/vendor/webcomponents-loader.js'
    },
    chunksSortMode: 'none'
  }),
  new HtmlWebpackExcludeAssetsPlugin(),
  new ScriptExtHtmlWebpackPlugin({
    defaultAttribute: 'defer'
  })
];

const createCommonConfig = config => ({
  entry: 'demo/index.ts',
  output: {
    path: config.OUTPUT_PATH,
    filename: '[name].[hash].bundle.js',
    pathinfo: true,
    publicPath: '/'
  },
  module: {
    rules: [
      {
        test: /\.ts?$/,
        use: {
          loader: 'ts-loader',
          options: { transpileOnly: true }
        }
      },
      {
        test: /\.(js)$/,
        exclude: resolve(__dirname, 'node_modules'),
        use: {
          loader: 'babel-loader',
          options: {
            presets: [
              [
                '@babel/preset-env',
                {
                  targets: {
                    browsers: [
                      // Best practice: https://github.com/babel/babel/issues/7789
                      '>=1%',
                      'not ie 11',
                      'not op_mini all'
                    ]
                  },
                  debug: true
                }
              ]
            ],
            plugins: [
              ['@babel/plugin-syntax-object-rest-spread', { useBuiltIns: true }],
              ['@babel/plugin-syntax-dynamic-import', { useBuiltIns: true }]
            ]
          }
        }
      },
      {
        test: /\.html$/,
        use: [{ loader: 'polymer-webpack-loader' }]
      },
      {
        test: /\.(png|jpg|gif)$/,
        use: [
          {
            loader: 'file-loader'
          }
        ]
      },
      {
        enforce: 'post',
        exclude: /(node_modules|\.test\.[tj]sx?$)/,
        test: /\.[tj]s$/,
        use: {
          loader: 'istanbul-instrumenter-loader',
          options: { esModules: true }
        }
      }
    ]
  },
  plugins: [
    // Defines environment
    new webpack.DefinePlugin({ 'process.env': processEnv }),
    // Render HTML entry point
    ...renderHtmlPlugins(),
    // Copy static Data
    config.IS_DEV_SERVER
      ? new CopyWebpackPlugin(copyStatics(config).copyWebcomponents)
      : new CopyWebpackPlugin([].concat(copyStatics(config).copyWebcomponents, copyStatics(config).copyOthers))
    // Load .env in project
    // new Dotenv()
  ],
  resolve: {
    modules: [__dirname, 'node_modules'],
    extensions: ['.ts', '.tsx', '.js']
  }
});

module.exports = createCommonConfig;
