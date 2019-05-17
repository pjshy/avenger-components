exports.getDevServer = (env = {}) => {
  return {
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
  }
}