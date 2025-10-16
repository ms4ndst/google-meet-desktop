const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

const mainConfig = {
    target: 'electron-main',
    entry: './src/index.js',
    output: {
        filename: 'index.js',
        path: path.resolve(__dirname, 'dist'),
    },
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                use: 'ts-loader',
                exclude: /node_modules/,
            },
        ],
    },
    resolve: {
        extensions: ['.tsx', '.ts', '.js'],
    },
    node: {
        __dirname: false,
        __filename: false,
    },
};

const rendererConfig = {
    target: 'electron-renderer',
    entry: {
        renderer: './src/renderer/scripts/window.js',
        preload: './src/renderer/preload.js',
    },
    output: {
        filename: '[name].js',
        path: path.resolve(__dirname, 'dist/renderer'),
    },
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                use: 'ts-loader',
                exclude: /node_modules/,
            },
            {
                test: /\.css$/,
                use: ['style-loader', 'css-loader'],
            },
        ],
    },
    resolve: {
        extensions: ['.tsx', '.ts', '.js'],
    },
    plugins: [
        new HtmlWebpackPlugin({
            template: './src/renderer/index.html',
            filename: 'index.html',
        }),
    ],
};

module.exports = [mainConfig, rendererConfig];