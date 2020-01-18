var admin = require("./webpack.config");

var HtmlWebpackPlugin = require("html-webpack-plugin");

var path = require("path");
var BUILD_DIR = path.resolve(__dirname, "adminbuild");
var APP_DIR = path.resolve(__dirname, "src/js/admin/");

admin.output.path = BUILD_DIR;
admin.entry = APP_DIR + "/app.tsx",
  admin.plugins[0] = new HtmlWebpackPlugin({
    "title": "Maestro Media Center",
    template: "template.html",
  });
admin.devServer = {
  disableHostCheck: true,
};
module.exports = admin;
