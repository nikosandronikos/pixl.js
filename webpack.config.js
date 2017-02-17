/* global __dirname */

var path = require('path');

var webpack = require('webpack');
var CopyWebpackPlugin = require('copy-webpack-plugin');

var dir_src = path.resolve(__dirname, 'src');
var dir_build = path.resolve(__dirname, 'build');

module.exports = {
    entry: path.resolve(dir_src, 'main.js'),
    output: {
        path: dir_build,
        filename: 'pixl.js'
    },
    devServer: {
        contentBase: dir_build,
    },
    module: {
        loaders: [
            {
                loader: 'babel-loader',
                test: dir_src,
            }
        ]
    },
    plugins: [
        new webpack.NoErrorsPlugin()
    ],
    stats: {
        colors: true
    },
    devtool: 'source-map',
};
