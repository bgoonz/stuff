var path = require('path')
var webpack = require('webpack')

module.exports = {
  entry: [
    './demo/router/main.js'
  ],
  output: {
    filename: 'demo/router/compiled.js'
  },
  plugins: [],
  resolve: {
    extensions: [ '', '.js', '.json' ]
  },
  module: {
    loaders: [
      {
        test: /\.vue$/,
        loader: 'vue'
      },
      {
        test: /\.js$/,
        loader: 'babel-loader',
        query: {
          presets: [ 'env', 'stage-2' ]
        },
        exclude: /node_modules/
      }
    ]
  }
}
