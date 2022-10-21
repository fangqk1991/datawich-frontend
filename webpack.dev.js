const { WebpackBuilder } = require('@fangcha/webpack')

module.exports = new WebpackBuilder()
  .setDevMode(true)
  .setPort(8080)
  .setEntry('./datawich/app.ts')
  .setHtmlTitle('Fangcha Datawich')
  .setExtras({
    devServer: {
      proxy: {
        '/api': `http://localhost:8081`,
      },
    },
  })
  .build()
