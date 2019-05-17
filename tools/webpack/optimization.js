const _ = require('lodash')
const UglifyJsPlugin = require('uglifyjs-webpack-plugin')
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin')

const { pickByCondition } = require('../utils')

exports.getOptimization = (env = {}) => {
 return {
  runtimeChunk: { name: 'manifest' },
  minimizer: _.compact([
    pickByCondition(!env.dev, new UglifyJsPlugin({
      parallel: true,
      uglifyOptions: {
        output: { comments: false }
      },
      sourceMap: false
    })),

    pickByCondition(!env.dev, new OptimizeCSSAssetsPlugin())
  ]),
  splitChunks: {
    cacheGroups: {
      vendor: {
        chunks: 'all',
        name: 'vendor',
        enforce: true,
        reuseExistingChunk: true,
        test: /[\\/]node_modules[\\/]/,
        priority: 90
      }
    }
  }
} 
}