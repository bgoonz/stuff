var path = require('path');
module.exports = {
    entry: {
        'falcor-datasource-chainer': './src/index.js'
    },
    output: {
        path: path.join(__dirname, "dist"),
        publicPath: "dist/",
        filename: "[name].min.js",
        chunkFilename: "[chunkhash].min.js"
    },
};
