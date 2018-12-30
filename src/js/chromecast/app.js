import React from "react";
import { render, } from "react-dom";
import { Router, Route, Link, hashHistory, } from "react-router";

require("./style.scss");

var host = process.env.HOST;
var scheme = "http";
var port = 3000;
var wsPort = port + 1;
var jquery = require("jquery");

var Home = require("./ChromecastHome");
var AuthTokenManger = require("../utilities/AuthTokenManager");
const SettingsManager = require("../utilities/CookiesSettingsManager");
var ApiRequester = require("../utilities/ApiRequester");
var QueryStringReader = require("../utilities/QueryStringReader");
var EpisodeLoader = require("../utilities/EpisodeLoader");
var WebSocketRemoteController = require("../utilities/WebSocketRemoteController");
const CacheProvider = require("../utilities/providers/CacheProvider");
const CacheBasedEpisodeProvider = require("../utilities/providers/CacheBasedEpisodeProvider");
const ShowProgressProvider = require("../utilities/providers/ShowProgressProvider");
const ChromecastListener = require("./ChromecastListener");
const VideoPlayer = require("../components/VideoPlayer");
const CollectionsManager = require("../utilities/CollectionsManager");
const MovieInfoProvider = require("../utilities/providers/MovieInfoProvider");

const authTokenManager = new AuthTokenManger(new QueryStringReader(), new SettingsManager());
var apiRequester = new ApiRequester(jquery, authTokenManager, scheme, host + ":" + port);
var episodeLoader = new EpisodeLoader(apiRequester);
const cacheProvider = new CacheProvider(apiRequester, {noPreload: true,});
const PlaylistProvider = require("../utilities/providers/PlaylistProvider");
const playlistProvider = new PlaylistProvider(apiRequester, cacheProvider);
const showProgressProvider = new ShowProgressProvider(apiRequester, cacheProvider);
const movieInfoProvider = new MovieInfoProvider(cacheProvider);
const collectionsManager = new CollectionsManager(apiRequester, movieInfoProvider);
const cacheBasedEpisodeProvider = new CacheBasedEpisodeProvider(apiRequester, cacheProvider, showProgressProvider);

var webSocketRemoteController = new WebSocketRemoteController(host, "Desktop Test Client", wsPort);

const chromecastListener = new ChromecastListener(apiRequester, authTokenManager, webSocketRemoteController, cacheProvider);
chromecastListener.initialize();

var div = document.createElement("div");
document.body.appendChild(div);

window.tvShowSort = function (a, b) {
  if (a.lastIndexOf(".") > -1) {
    a = a.substring(0, a.lastIndexOf("."));
  }
  if (b.lastIndexOf(".") > -1) {
    b = b.substring(0, b.lastIndexOf("."));
  }
  return a.localeCompare(b, undefined, { numeric: true, sensitivity: "base", });
};

const VideoLoader = require("../utilities/VideoLoader");
const videoLoader = new VideoLoader();

const episodeProvider = cacheBasedEpisodeProvider;
render((
  <Router history={hashHistory}>
    <Route path="/" component={(props) => (<Home {...props} chromecastListener={chromecastListener} />)} >
      <Route path="view" component={(props) => (<VideoPlayer {...props} playlistManager={playlistProvider} collectionsManager={collectionsManager} videoLoader={videoLoader} isChromecast={true} showProgressProvider={showProgressProvider} episodeLoader={episodeProvider} remoteController={webSocketRemoteController} />)} />
    </Route>
  </Router>
), div);

