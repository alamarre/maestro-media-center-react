var debug = process.env.NODE_ENV !== "production";
var webpack = require('webpack');
var HtmlWebpackPlugin = require('html-webpack-plugin');
var ExtractTextPlugin = require('extract-text-webpack-plugin');

var path = require('path');
var BUILD_DIR = path.resolve(__dirname, 'build');
var APP_DIR = path.resolve(__dirname, 'src/js/');

var jquery = require("jquery");

module.exports = {
  context: __dirname,
  devtool: debug ? "inline-sourcemap" : null,
  entry: APP_DIR + "/web/app.js",
  output: {
    path: BUILD_DIR,
    filename: "app.js"
  },
  module : {
    rules: [
        {
            test : /\.jsx?/,
            include : APP_DIR,
            loader : 'babel-loader'
        },
        {
            test: /\.json$/,
            include : APP_DIR,
            use: 'json-loader'
        },
        {
            test: /\.scss$/,
            include : APP_DIR,
            loader: ExtractTextPlugin.extract('css-loader!sass-loader')
        },
        {
            test: /\.svg$/,
            include : APP_DIR,
            loader: 'svg-url-loader'
        }

    ]
  },
  plugins: debug ? [
      new HtmlWebpackPlugin({
          "title":"Maestro Media Center",
          template: "template.html"
        }),
      new webpack.ProvidePlugin({
      jQuery: 'jquery',
      $: 'jquery',
      jquery: 'jquery'
    }),
      new ExtractTextPlugin({
            filename: "style.css",
            allChunks: true
        })
  ] : [
    new webpack.optimize.DedupePlugin(),
    new webpack.optimize.OccurenceOrderPlugin(),
    new webpack.optimize.UglifyJsPlugin({ mangle: false, sourcemap: false }),
  ],
};