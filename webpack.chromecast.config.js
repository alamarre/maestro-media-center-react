var chromecast = require("./webpack.config");

var HtmlWebpackPlugin = require('html-webpack-plugin');

var path = require('path');
var APP_DIR = path.resolve(__dirname, 'src/js/chromecast/');

chromecast.entry = APP_DIR + "/app.js",
chromecast.plugins[0] = new HtmlWebpackPlugin({
    "title":"Maestro Media Center",
    template: "src/js/chromecast/template.html"
  })
module.exports = chromecast;