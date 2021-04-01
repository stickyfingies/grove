"use strict";

import path from "path";
import webpack from "webpack";

let last = "";

export default {
    mode: "development",
    name: "js",
    entry: {
        latest: "./src/js/main.js",
        graphicsworker: "./src/js/graphicsworker.js",
    },
    output: {
        filename: "[name].js",
        chunkFilename: "[chunkhash].js",
        path: path.resolve("public/js/dist")
    },
    module: {
        rules: [{
            test: /\.sass$/,
            use: [
                "style-loader",
                "css-loader?minimize=true",
                "sass-loader"
            ]
        }, {
            test: /\.js/,
            resolve: {
                fullySpecified: false
            }
        }],
    },
    optimization: {
        runtimeChunk: "single",
        splitChunks: {
            chunks: "all",
            cacheGroups: {
                vendor: {
                    test: /node_modules/,
                    chunks: "initial",
                    name: "vendor",
                    enforce: true
                }
            }
        }
    },
    plugins: [
        new webpack.ProgressPlugin(function handler(percentage, msg) {
            if (last !== msg) console.log(Math.floor(percentage * 100) + "% - " + msg);
            last = msg;
        }),
        new webpack.BannerPlugin("\nMade with <3 by the Grove team | " + new Date() + "\n"),
        // new webpack.optimize.LimitChunkCountPlugin({
        //     maxChunks: 1,
        // }),
    ],
    resolve: {
        extensions: [".js", ".json", ".sass"]
    }
};

//
//                       _oo0oo_
//                      o8888888o
//                      88" . "88
//                      (| -_- |)
//                      0\  =  /0
//                    ___/`---"\___
//                  ." \\|     |// ".
//                 / \\|||  :  |||// \
//                / _||||| -:- |||||- \
//               |   | \\\  -  /// |   |
//               | \_|  ""\---/""  |_/ |
//               \  .-\__  "-"  ___/-. /
//             ___". ."  /--.--\  `. ."___
//          ."" "<  `.___\_<|>_/___." >" "".
//         | | :  `- \`.;`\ _ /`;.`/ - ` : | |
//         \  \ `_.   \_ __\ /__ _/   .-` /  /
//     =====`-.____`.___ \_____/___.-`___.-"=====
//                       `=---="
//
//
//     ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
//
//               Buddha bless the code
//
