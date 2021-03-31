"use strict";

import path from "path";
import webpack from "webpack";

export default {
    mode: "development",
    name: "js",
    entry: {
        "latest": "./src/js/main.js",
        "graphics-worker": "./src/js/graphics-worker.js"
    },
    output: {
        filename: "[name].js",
        path: path.resolve("public/js")
    },
    module: {
        rules: [{
            test: /\.sass$/,
            include: path.resolve("src/css"),
            use: [
                "style-loader",
                "css-loader?minimize=true",
                "sass-loader"
            ]
        }, {
            test: /\.js/,
            include: path.resolve("src/js"),
            resolve: {
                fullySpecified: false
            }
        }],
    },
    optimization: {
        runtimeChunk: "single",
        splitChunks: {
            cacheGroups: {
                vendor: {
                    test: /node_modules/,
                    chunks: "initial",
                    name: "vendor",
                    reuseExistingChunk: true,
                    enforce: true
                }
            }
        } 
    },
    resolve: {
        extensions: [".js", ".json", ".sass"],
        symlinks: false
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
