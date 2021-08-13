const path = require('path');

const browserConfig = {
    target: 'web',
    entry: './src/content-fetch.js',
    output: {
        filename: 'agility-content-fetch.browser.js',
        path: path.resolve(__dirname, 'dist'),
        library: 'agility',
        libraryTarget: 'umd',
        libraryExport: 'default',
        umdNamedDefine: true,
        globalObject: 'typeof self !== \'undefined\' ? self : this'
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

const nodeConfig = {
    target: 'node',
    entry: './src/content-fetch.js',
    output: {
        filename: 'agility-content-fetch.node.js',
        path: path.resolve(__dirname, 'dist'),
        library: 'agility',
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

module.exports = [browserConfig, nodeConfig]