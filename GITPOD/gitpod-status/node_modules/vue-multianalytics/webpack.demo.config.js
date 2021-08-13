var path = require('path')
var webpack = require('webpack')

module.exports = {
  entry: [
    './demo/simple/main.js'
  ],
  output: {
    filename: 'demo/simple/compiled.js'
  },
  plugins: [],
  resolve: {
    extensions: [ '', '.js', '.json' ]
  },
  module: {
    loaders: [
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
