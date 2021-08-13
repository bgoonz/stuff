'use strict';
const path = require('path');

module.exports = {
    mode: 'production',
    entry: {
        gitpodify: './dist/gitpodify.js',
    },
    output: {
        filename: 'bundles/[name].bundle.js',
        path: path.resolve(__dirname, 'dist')
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /node_modules/,
            }
        ]
    }
};
