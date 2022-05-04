const { WebpackBuilder } = require('@fangcha/webpack')

module.exports = new WebpackBuilder()
  .setDevMode(true)
  .setEntry('./datawich/app.ts')
  .setHtmlTitle('Fangcha Datawich')
  .setExtras({
    devServer: {
      proxy: {
        '/api': `http://localhost:6800`,
      },
    },
  })
  .build()
