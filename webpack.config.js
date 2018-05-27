var debug = process.env.NODE_ENV !== "production";
const appId = process.env.CHROMECAST_DEBUG ? "D8828ECA" : "C3639C8B";
var webpack = require('webpack');
var HtmlWebpackPlugin = require('html-webpack-plugin');
var ExtractTextPlugin = require('extract-text-webpack-plugin');

var path = require('path');
var BUILD_DIR = path.resolve(__dirname, 'build');
var APP_DIR = path.resolve(__dirname, 'src/js/');

var jquery = require("jquery");
var alwaysPlugins = [
    new HtmlWebpackPlugin({
    "title":"Maestro Media Center",
    template: "template.html"
  }),
new webpack.ProvidePlugin({
  jQuery: 'jquery',
  $: 'jquery',
  jquery: 'jquery',
  'window.jQuery': 'jquery',
  Popper: ['popper.js', 'default']
}),
new webpack.DefinePlugin({
  'process.env': {
    'CHROMECAST_APP_ID': JSON.stringify(appId)
  },
}),
new ExtractTextPlugin({
      filename: "style.css",
      allChunks: true
  })]
module.exports = {
  context: __dirname,
  devtool: debug ? "inline-sourcemap" : false,
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
            test: /\.svg$/,
            include : APP_DIR,
            loader: 'svg-url-loader'
        },
        {
            test: /\.woff2?(\?v=[0-9]\.[0-9]\.[0-9])?$/,
            // Limiting the size of the woff fonts breaks font-awesome ONLY for the extract text plugin
            // loader: "url?limit=10000"
            use: "url-loader"
        },
        {
            test: /\.(ttf|eot|svg)(\?[\s\S]+)?$/,
            use: 'file-loader'
        },
        {
            test: /\.(scss)$/,
            use: [{
              loader: 'style-loader', // inject CSS to page
            }, {
              loader: 'css-loader', // translates CSS into CommonJS modules
            }, {
              loader: 'postcss-loader', // Run post css actions
              options: {
                plugins: function () { // post css plugins, can be exported to postcss.config.js
                  return [
                    require('precss'),
                    require('autoprefixer')
                  ];
                }
              }
            }, {
              loader: 'sass-loader' // compiles SASS to CSS
            }]
        }

    ]
  },
  plugins: debug ? alwaysPlugins.concat([
    new webpack.DefinePlugin({
        'process.env': {
          'PORT': 3000
        },
      })
  ]): alwaysPlugins.concat([
    new webpack.optimize.DedupePlugin(),
    new webpack.optimize.UglifyJsPlugin({ mangle: false, sourcemap: true }),
  ]),
};