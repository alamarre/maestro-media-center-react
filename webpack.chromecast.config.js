var chromecast = require("./webpack.config");

var path = require('path');
var APP_DIR = path.resolve(__dirname, 'src/js/chromecast/');

chromecast.entry = APP_DIR + "/app.js",
module.exports = chromecast;