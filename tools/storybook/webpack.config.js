const path = require('path')

const { getCssRules, getStylusRules } = require('../webpack/rules')

// Export a function. Accept the base config as the only param.
module.exports = async ({ config }) => {
  // `mode` has a value of 'DEVELOPMENT' or 'PRODUCTION'
  // You can change the configuration based on that.
  // 'PRODUCTION' is used when building the static version of storybook.

  // rules
  config.module.rules.push(
    {
      test: /\.stories\.(t|j)sx?$/,
      use: [
        {
          loader: require.resolve('@storybook/addon-storysource/loader'),
          options: { parser: 'typescript' }
        },
      ],
      enforce: 'pre',
      exclude: /node_modules/,
    },
    {
      test: /\.tsx?$/,
      use: [
        'babel-loader',
        'react-docgen-typescript-loader'
      ],
      exclude: /node_modules/
    },
    ...getCssRules(),
    ...getStylusRules()
  )

  // resolve
  config.resolve.extensions.push('.tsx', '.ts')

  config.resolve.alias.components = path.resolve(__dirname, '../../components/')

  // Return the altered config
  return config
}