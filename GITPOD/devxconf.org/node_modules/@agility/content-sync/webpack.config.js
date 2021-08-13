const path = require('path');


const nodeConfig = {
    target: 'node',
    entry: './src/sync-client.js',
    output: {
        filename: 'agility-sync-sdk.node.js',
        path: path.resolve(__dirname, 'dist'),
        library: 'agilitySync',
        libraryTarget: 'umd',
        libraryExport: 'default',
        umdNamedDefine: true,
        globalObject: 'typeof self !== \'undefined\' ? self : this'
    },
    optimization: {
        minimize: false
    },
    module: {
        rules : [
        // JavaScript
        {
            test: /\.js$/,
            exclude: /node_modules/,
            use: ['babel-loader'],
        }
        ]
    },
    // Plugins
    plugins: []
}

module.exports = nodeConfig