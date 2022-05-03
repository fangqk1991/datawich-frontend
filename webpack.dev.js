const { WebpackBuilder } = require('@fangcha/webpack')

module.exports = new WebpackBuilder()
  .setDevMode(true)
  .setEntry('./tests/app.ts')
  .setHtmlTitle('Fangcha Test')
  .build()
