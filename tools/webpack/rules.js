const { paths } = require('./paths')

 function getScriptRules () {
  return [
    {
      test: /\.tsx?$/,
      exclude: /node_modules/,
      loader: 'babel-loader'
    }
  ]
}

function getCssRules () {
  return [
    {
      test: /\.css$/,
      use: [
        'style-loader',
        {
          loader: 'css-loader',
          options: {
            modules: true,
            localIdentName: '[local]__[hash:base64:4]'
          }
        },
        'postcss-loader'
      ]
    }
  ]
}

function getStylusRules () {
  return [
    {
      test: /\.styl$/,
      use: [
        'style-loader',
        {
          loader: 'css-loader',
          options: {
            modules: true,
            localIdentName: '[local]__[hash:base64:4]'
          }
        },
        'postcss-loader',
        'stylus-loader'
      ]
    }
  ]
}

function getFileRules () {
  return [
    {
      test: /\.(gif|png|jpe?g)$/i,
      use: [{
        loader: 'url-loader',
        options: {
          name: paths.imageName,
          limit: 2 * 1024
        }
      }]
    },
    {
      test: /\.woff((\?|#)[?#\w\d_-]+)?$/,
      use: [{
        loader: 'url-loader',
        options: {
          limit: 100,
          minetype: 'application/font-woff',
          name: paths.fontName
        }
      }]
    },
    {
      test: /\.woff2((\?|#)[?#\w\d_-]+)?$/,
      use: [{
        loader: 'url-loader',
        options: {
          limit: 100,
          minetype: 'application/font-woff2',
          name: paths.fontName
        }
      }]
    },
    {
      test: /\.ttf((\?|#)[?#\w\d_-]+)?$/,
      use: [{
        loader: 'url-loader',
        options: {
          limit: 100,
          minetype: 'application/octet-stream',
          name: paths.fontName
        }
      }]
    },
    {
      test: /\.eot((\?|#)[?#\w\d_-]+)?$/,
      use: [{
        loader: 'url-loader',
        options: {
          limit: 100,
          name: paths.fontName
        }
      }]
    }
  ]
}

module.exports = {
  getScriptRules,
  getCssRules,
  getStylusRules,
  getFileRules
}