const path = require('path')
const _ = require('lodash')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const UglifyJsPlugin = require('uglifyjs-webpack-plugin')
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin')
const AssetsPlugin = require('assets-webpack-plugin')

const { getScriptRules, getCssRules, getStylusRules, getFileRules } = require('./rules')
const { paths } = require('./paths')

function pickByCondition (condition, trueValue, falseValue = false) {
  return condition ? trueValue : falseValue
}

module.exports = (env = {}) => {
  const isDev = !!env.dev

  return {
    mode: isDev ? 'development' : 'production',

    devtool: 'nosources-source-map',

    devServer: {
      compress: true,
      headers: {
        'Access-Control-Allow-Origin': '*'
      },
      historyApiFallback: true,
      hot: false,
      host: '0.0.0.0',
      disableHostCheck: true,
      port: env.port || 3000,
      stats: 'errors-only'
    },

    entry: {
      main: path.resolve(__dirname, './src/index.tsx')
    },

    output: {
      chunkFilename: paths.jsName,
      filename: paths.jsName,
      path: path.resolve(__dirname, './dist'),
      pathinfo: true,
      publicPath: '/'
    },

    resolve: {
      extensions: [
        '.ts',
        '.tsx',
        '.js',
      ],
      modules: ['node_modules', path.resolve(__dirname, './src')]
    },

    module: {
      rules: [
        {
          test: /\.tsx?$/,
          enforce: 'pre',
          exclude: [/node_modules/],
          loader: 'tslint-loader',
          options: {
            formatter: 'stylish'
          }
        },
        ...getScriptRules(),
        ...getCssRules(),
        ...getStylusRules(),
        ...getFileRules()
      ]
    },

    plugins: _.compact([
      pickByCondition(isDev, new HtmlWebpackPlugin({
        inject: true,
        template: path.resolve(__dirname, './pages/index.html')
      })),

      pickByCondition(!isDev, new AssetsPlugin({
        // name for the created json file.
        filename: 'assets.json',
        // path where to save the created JSON file
        path: path.resolve(__dirname, './dist'),
        // whether to format the JSON output for readability
        prettyPrint: true
      })),
    ]),

    optimization: {
      runtimeChunk: { name: 'manifest' },
      minimizer: _.compact([
        pickByCondition(!isDev, new UglifyJsPlugin({
          parallel: true,
          uglifyOptions: {
            output: { comments: false }
          },
          sourceMap: false
        })),
    
        pickByCondition(!isDev, new OptimizeCSSAssetsPlugin())
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
}