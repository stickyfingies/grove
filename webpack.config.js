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

// import { BundleAnalyzerPlugin } from 'webpack-bundle-analyzer';
import CopyPlugin from 'copy-webpack-plugin';
import ForkTsCheckerWebpackPlugin from 'fork-ts-checker-webpack-plugin';

const commonConfig = {
    mode: 'development',
    name: 'js',
    output: {
        filename: '[name].cjs',
        chunkFilename: '[id].js',
        path: path.resolve('dist/js/'),
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
            test: /\.(c?)js$/,
            exclude: /node_modules/,
            resolve: {
                fullySpecified: false,
            },
        }, {
            test: /\.ts$/,
            exclude: /node_modules/,
            use: ['ts-loader?transpileOnly=true'], // transpile only, for concurrent typechecking
        }],
    },
    plugins: [
        new webpack.BannerPlugin(`\nMade with <3 by the Grove team | ${new Date()}\n`),
        // new BundleAnalyzerPlugin(),
        new CopyPlugin({
            patterns: [
                'src/js/ammo/ammo.wasm.js',
                'src/js/ammo/ammo.wasm.wasm',
            ],
        }),
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

const createConfig = (opts) => ({ ...commonConfig, ...opts });

export default [
    createConfig({
        target: 'web',
        entry: {
            main: './src/js/main.ts',
        },
    }),
    createConfig({
        target: 'electron-main',
        entry: {
            app: './src/js/app.ts',
        },
    }),
];
