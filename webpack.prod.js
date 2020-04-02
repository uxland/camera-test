const { CleanWebpackPlugin } = require('clean-webpack-plugin');

const createProConfig = config => ({
  mode: 'production',
  devtool: 'source-map',
  module: {
    rules: [
      {
        test: /\.css|\.s(c|a)ss$/,
        use: [
          { loader: 'css-loader' },
          {
            loader: 'sass-loader',
            options: {
            }
          }
        ]
      }
    ]
  },
  plugins: [
    // Copy static Data
    new CleanWebpackPlugin({ verbose: true, outputPath: config.OUTPUT_PATH })
  ],
  optimization: {
    splitChunks: {
      chunks: 'async',
      minSize: 30000,
      maxSize: 0,
      minChunks: 1,
      maxAsyncRequests: 5,
      maxInitialRequests: 3,
      automaticNameDelimiter: '-',
      name: true,
      cacheGroups: {
        vendors: {
          test: /[\\/]node_modules[\\/]/,
          priority: -10
        },
        default: {
          minChunks: 1,
          priority: -20,
          reuseExistingChunk: true
        }
      }
    }
  }
});

module.exports = createProConfig;
