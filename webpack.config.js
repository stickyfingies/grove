'use strict';

const path = require('path'),
    webpack = require("webpack");
let last = '';

module.exports = [{
    name: 'js',
    entry: {
        latest: './src/js/main.js'
    },
    output: {
        filename: '[name].js',
        path: path.resolve(__dirname, 'public/js')
    },
    module: {
        rules: [{
            test: /\.sass$/,
            use: [
                'style-loader',
                'css-loader?minimize=true',
                'sass-loader'
            ]
        }, {
            test: /\.js$/,
            exclude: /(node_modules|bower_components)/,
            loader: 'babel-loader',
            query: {
                presets: ['latest'],
                cacheDirectory: true
            }
        }]
    },
    plugins: [
        new webpack.ProgressPlugin(function handler(percentage, msg) {
            if (last !== msg) console.log(Math.floor(percentage * 100) + '% - ' + msg);
            last = msg;
        }),
        new webpack.optimize.CommonsChunkPlugin({
            name: 'vendor',
            minChunks: (module) => {
                var userRequest = module.userRequest;
                if (typeof userRequest !== 'string')
                    return false;
                return userRequest.indexOf('bower_components') >= 0 ||
                    userRequest.indexOf('node_modules') >= 0 ||
                    userRequest.indexOf('libraries') >= 0;
            }
        }),
        new webpack.optimize.UglifyJsPlugin({}),
        new webpack.optimize.OccurrenceOrderPlugin(true),
        new webpack.ProvidePlugin({
            THREE: 'three',
            CANNON: 'cannon',
            _: 'lodash'
        }),
        new webpack.BannerPlugin('\nMade with <3 by the Grove team | ' + new Date() + '\n')
    ],
    resolve: {
        extensions: ['.js', '.json', '.sass']
    }
}];

//
//                       _oo0oo_
//                      o8888888o
//                      88" . "88
//                      (| -_- |)
//                      0\  =  /0
//                    ___/`---'\___
//                  .' \\|     |// '.
//                 / \\|||  :  |||// \
//                / _||||| -:- |||||- \
//               |   | \\\  -  /// |   |
//               | \_|  ''\---/''  |_/ |
//               \  .-\__  '-'  ___/-. /
//             ___'. .'  /--.--\  `. .'___
//          ."" '<  `.___\_<|>_/___.' >' "".
//         | | :  `- \`.;`\ _ /`;.`/ - ` : | |
//         \  \ `_.   \_ __\ /__ _/   .-` /  /
//     =====`-.____`.___ \_____/___.-`___.-'=====
//                       `=---='
//
//
//     ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
//
//               Buddha bless the code
//
