"use strict";

import path from "path";
import webpack from "webpack";
import ForkTsCheckerWebpackPlugin from "fork-ts-checker-webpack-plugin";

let last = "";

export default {
    mode: "development",
    name: "js",
    entry: {
        main: "./src/js/main.ts",
    },
    output: {
        filename: "[name].js",
        chunkFilename: "[chunkhash].js",
        path: path.resolve("static/js/dist")
    },
    watchOptions: {
        ignored: ["**/node_modules", "server/"]
    },
    module: {
        rules: [{
            test: /\.css$/,
            use: [
                "style-loader",
                "css-loader?minimize=true"
            ]
        }, {
            test: /\.js$/,
            exclude: /node_modules/,
            resolve: {
                fullySpecified: false
            }
        }, {
            test: /\.ts$/,
            exclude: /node_modules/,
            loader: "ts-loader",
            options: {
                transpileOnly: true
            }
        }],
    },
    optimization: {
        runtimeChunk: "single",
        splitChunks: {
            chunks: "all",
            hidePathInfo: true,
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
        new webpack.BannerPlugin("\nMade with <3 by the Grove team | " + new Date() + "\n"),
        new ForkTsCheckerWebpackPlugin({
            typescript: {
                diagnosticOptions: {
                    semantic: true,
                    syntactic: true,
                },
            },
        })
    ],
    resolve: {
        extensions: [".ts", ".js", ".json", ".css"]
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
