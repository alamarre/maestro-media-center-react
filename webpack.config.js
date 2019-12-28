var debug = process.env.NODE_ENV !== "production";
const appId = process.env.CHROMECAST_DEBUG ? "D8828ECA" : "C3639C8B";
var webpack = require("webpack");
var HtmlWebpackPlugin = require("html-webpack-plugin");
var ExtractTextPlugin = require("extract-text-webpack-plugin");
const WebpackPwaManifest = require("webpack-pwa-manifest");

var path = require("path");
var BUILD_DIR = path.resolve(__dirname, "build");
var APP_DIR = path.resolve(__dirname, "src/js/");

var jquery = require("jquery");
const BundleAnalyzerPlugin = require("webpack-bundle-analyzer").BundleAnalyzerPlugin;

var alwaysPlugins = [



  //new BundleAnalyzerPlugin(),
  new HtmlWebpackPlugin({
    "title": "Maestro Media Center",
    template: "template.html",
  }),
  new WebpackPwaManifest({
    name: "Maestro Media Center",
    short_name: process.env.PWA_NAME || "Maestro",
    description: "",
    background_color: "#ff0000",
    crossorigin: "use-credentials", //can be null, use-credentials or anonymous
    icons: [
      {
        src: path.resolve("m-maestro.png"),
        sizes: [96, 128, 192, 256, 384, 512, 1024,], // multiple sizes,
        destination: path.join("icons", "ios"),
        ios: true,
      },
      {
        src: path.resolve("m-maestro.png"),
        size: 1024, // multiple sizes,
        destination: path.join("icons", "ios"),
        ios: "startup",
      },
    ],
    inject: true,
    ios: {
      "apple-mobile-web-app-title": "Maestro",
      "apple-mobile-web-app-status-bar-style": "black",
    },

  }),
  new webpack.ProvidePlugin({
    jQuery: "jquery",
    $: "jquery",
    jquery: "jquery",
    "window.jQuery": "jquery",
    Popper: ["popper.js", "default",],
  }),
  new webpack.DefinePlugin({
    "process.env": {
      "CHROMECAST_APP_ID": JSON.stringify(appId),
    },
  }),
  new ExtractTextPlugin({
    filename: "style.css",
    allChunks: true,
  }),];
module.exports = {
  devServer: {
    compress: true,
    host: "0.0.0.0",
    port: process.env.LOCAL_PORT || 3000,
  },
  context: __dirname,
  devtool: debug ? "inline-sourcemap" : "sourcemap",
  entry: APP_DIR + "/web/app.tsx",
  mode: debug ? "development" : "production",
  output: {
    path: BUILD_DIR,
    filename: "app.js",
  },
  optimization: {
    minimize: debug ? false : true,
  },
  resolve: {
    extensions: [".tsx", ".ts", ".js", ".jsx",],
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        include: APP_DIR,
        exclude: /node_modules/,
        use: "ts-loader",
      },
      {
        test: /\.jsx?/,
        include: APP_DIR,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader",
          options: {
            presets: ["@babel/preset-env", "@babel/preset-react",],
          },
        },
      },
      {
        test: /\.json$/,
        include: APP_DIR,
        use: "json-loader",
      },
      {
        test: /\.svg$/,
        include: APP_DIR,
        loader: "svg-url-loader",
      },
      {
        test: /\.woff2?(\?v=[0-9]\.[0-9]\.[0-9])?$/,
        // Limiting the size of the woff fonts breaks font-awesome ONLY for the extract text plugin
        // loader: "url?limit=10000"
        use: "url-loader",
      },
      {
        test: /\.(ttf|eot|svg)(\?[\s\S]+)?$/,
        use: "file-loader",
      },
      {
        test: /\.(s?css)$/,
        use: [{
          loader: "style-loader", // inject CSS to page
        }, {
          loader: "css-loader", // translates CSS into CommonJS modules
        }, {
          loader: "postcss-loader", // Run post css actions
          options: {
            plugins: function () { // post css plugins, can be exported to postcss.config.js
              return [
                require("precss"),
                require("autoprefixer"),
              ];
            },
          },
        }, {
          loader: "sass-loader", // compiles SASS to CSS
        },],
      },

    ],
  },
  plugins: debug ? alwaysPlugins.concat([
    new webpack.DefinePlugin({
      "process.env": {
        "PORT": process.env.PORT || 3000,
        "HOST": JSON.stringify(process.env.HOST),
        "SCHEME": JSON.stringify(process.env.SCHEME),
        "WEBSOCKET_HOST": JSON.stringify(process.env.WEBSOCKET_HOST),
        "WEBSOCKET_PORT": JSON.stringify(process.env.WEBSOCKET_PORT),
      },
    }),
  ]) : alwaysPlugins.concat([
    new webpack.DefinePlugin({
      "process.env": {
        "HOST": JSON.stringify(process.env.HOST),
        "SCHEME": JSON.stringify(process.env.SCHEME),
        "WEBSOCKET_HOST": JSON.stringify(process.env.WEBSOCKET_HOST),
        "WEBSOCKET_PORT": JSON.stringify(process.env.WEBSOCKET_PORT),
      },
    }),
  ]),
};
