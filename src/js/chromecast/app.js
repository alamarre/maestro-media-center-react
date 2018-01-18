import React from 'react'
import { render } from 'react-dom'
import { Router, Route, Link, hashHistory } from 'react-router'

require("./style.scss");

var host = "localhost";
var scheme = "http";
var port = 3000;
var wsPort = port+1;
var jquery = require("jquery");

var Home = require("./ChromecastHome");
var AuthTokenManger = require("../utilities/AuthTokenManager");
var ApiRequester = require("../utilities/ApiRequester");
var QueryStringReader = require("../utilities/QueryStringReader");
var EpisodeLoader = require("../utilities/EpisodeLoader");
var WebSocketRemoteController = require("../utilities/WebSocketRemoteController");
let CacheProvider = require("../utilities/providers/CacheProvider");
let CacheBasedEpisodeProvider = require("../utilities/providers/CacheBasedEpisodeProvider");
let ShowProgressProvider = require("../utilities/providers/ShowProgressProvider");
let ChromecastListener = require("./ChromecastListener");
let VideoPlayer = require("../components/VideoPlayer")

let authTokenManager = new AuthTokenManger(new QueryStringReader());
var apiRequester = new ApiRequester(jquery, authTokenManager, scheme, host+":"+port);
var episodeLoader = new EpisodeLoader(apiRequester);
let cacheProvider = new CacheProvider(apiRequester);
let showProgressProvider = new ShowProgressProvider(apiRequester, cacheProvider);

var webSocketRemoteController = new WebSocketRemoteController(host, "Desktop Test Client", wsPort);

let chromecastListener = new ChromecastListener(apiRequester, authTokenManager, webSocketRemoteController, cacheProvider);
chromecastListener.initialize();

var div = document.createElement("div");
document.body.appendChild(div);

window.tvShowSort = function(a, b) {
  if(a.lastIndexOf(".") > -1) {
    a = a.substring(0, a.lastIndexOf("."));
  }
  if(b.lastIndexOf(".") > -1) {
    b = b.substring(0, b.lastIndexOf("."));
  }
  return a.localeCompare(b, undefined, {numeric: true, sensitivity: 'base'});
}

let VideoLoader = require("../utilities/VideoLoader");
const videoLoader = new VideoLoader();

render((
  <Router history={hashHistory}>
    <Route path="/" component={(props) => (<Home {...props} chromecastListener={chromecastListener} />)} >
      <Route path="view"component={(props) => (<VideoPlayer {...props} videoLoader={videoLoader} isChromecast={true} showProgressProvider={showProgressProvider} episodeLoader={episodeLoader} remoteController={webSocketRemoteController} />)} />
    </Route>
  </Router>
), div)

