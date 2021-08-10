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
//           Buddha bless the build script.
//

import path from 'path';
import webpack from 'webpack';

import { BundleAnalyzerPlugin } from 'webpack-bundle-analyzer';
import ForkTsCheckerWebpackPlugin from 'fork-ts-checker-webpack-plugin';

export default {
    mode: 'development',
    name: 'js',
    entry: {
        main: './src/js/main.ts',
    },
    output: {
        filename: '[name].cjs',
        chunkFilename: '[chunkhash].js',
        path: path.resolve('dist/js/'),
        clean: true,
    },
    watchOptions: {
        ignored: ['**/node_modules', 'server/'],
    },
    module: {
        rules: [{
            test: /\.css$/,
            use: [
                'style-loader',
                'css-loader?url=false',
            ],
        }, {
            test: /\.js$/,
            exclude: /node_modules/,
            resolve: {
                fullySpecified: false,
            },
        }, {
            test: /\.ts$/,
            exclude: /node_modules/,
            use: ['ts-loader?transpileOnly=true'], // transpile only so we can run typechecking concurrently
        }],
    },
    optimization: {
        runtimeChunk: 'single',
        splitChunks: {
            chunks: 'all',
            hidePathInfo: true,
            cacheGroups: {
                vendor: {
                    test: /node_modules/,
                    chunks: 'initial',
                    name: 'vendor',
                    enforce: true,
                },
            },
        },
    },
    plugins: [
        new webpack.BannerPlugin(`\nMade with <3 by the Grove team | ${new Date()}\n`),
        new BundleAnalyzerPlugin(),
        new ForkTsCheckerWebpackPlugin({
            typescript: {
                diagnosticOptions: {
                    semantic: true,
                    syntactic: true,
                },
            },
        }),
    ],
    resolve: {
        extensions: ['.ts', '.js', '.json', '.css'],
    },
};
