module.exports = function (context) {
  const plugins = [
    require('autoprefixer')({
      'browsers': [
        '> 1%',
        'Firefox ESR',
        'last 4 versions',
        'not ie < 9'
      ]
    })
  ]

  return {
    from: context.from,
    plugins: plugins,
    to: context.to
  }
}
