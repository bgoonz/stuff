var path = require('path')
var webpack = require('webpack')

module.exports = {
  entry: {
    'vue-multianalytics': './src/index.js',
    'vue-multianalytics.min': './src/index.js'
  },
  output: {
    path: "./dist",
    filename: "[name].js",
    libraryTarget: 'commonjs2'
  },
  plugins: [
    new webpack.optimize.UglifyJsPlugin({
      include: /\.min\.js$/,
      compress: {
        warnings: false
      }
    }),
  ],
  resolve: {
    extensions: [ '', '.js', '.json' ]
  },
  module: {
    loaders: [
      {
        test: /\.js$/,
        loader: 'babel-loader',
        query: {
          presets: [ 'env', 'stage-2' ],
          plugins: [
            "transform-async-to-generator",
            "transform-object-assign",
          ],
        },
        exclude: /node_modules/
      }
    ]
  }
}
