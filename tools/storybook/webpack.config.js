const { getScriptRules, getCssRules, getStylusRules } = require('../webpack/rules')

// Export a function. Accept the base config as the only param.
module.exports = async ({ config }) => {
  // `mode` has a value of 'DEVELOPMENT' or 'PRODUCTION'
  // You can change the configuration based on that.
  // 'PRODUCTION' is used when building the static version of storybook.

  // rules
  config.module.rules.push(
    ...getScriptRules(),
    ...getCssRules(),
    ...getStylusRules()
  )

  // resolve
  config.resolve.extensions.push('.tsx', '.ts')

  // Return the altered config
  return config
}