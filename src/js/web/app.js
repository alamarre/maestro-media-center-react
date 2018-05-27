//import 'bootstrap';
import 'font-awesome/scss/font-awesome.scss';
import React from 'react'
import { render } from 'react-dom'
import { Router, Route, Link, hashHistory } from 'react-router'

require("../style.scss");

var host = (window.maestroSettings && window.maestroSettings.HOST) || window.location.hostname;

// this could also have been done with substring, but was simple
var scheme = (window.maestroSettings && window.maestroSettings.PROTOCOL) || (window.location.protocol == "http:" ? "http": "https");
var port = (window.maestroSettings && window.maestroSettings.PORT) 
  || process.env.PORT 
  || window.location.port 
  || (scheme == "http" ? 80 : 443);
var wsPort = port;
var jquery = require("jquery");

var Home = require("../components/Home");
var VideoPlayer = require("../components/VideoPlayer");
var VideosListing = require("../components/VideosListing");
var AuthTokenManger = require("../utilities/AuthTokenManager");
var ApiRequester = require("../utilities/ApiRequester");
var QueryStringReader = require("../utilities/QueryStringReader");
var EpisodeLoader = require("../utilities/EpisodeLoader");
var WebSocketRemoteController = require("../utilities/WebSocketRemoteController");
let CacheProvider = require("../utilities/providers/CacheProvider");
let CacheBasedEpisodeProvider = require("../utilities/providers/CacheBasedEpisodeProvider");
let SearchBasedShowProvider = require("../utilities/providers/SearchBasedShowProvider");
let ShowProgressProvider = require("../utilities/providers/ShowProgressProvider");
let ChromecastManager  = require("../utilities/ChromecastManager");
let SettingsManager = require("../utilities/CookiesSettingsManager");
let VideoLoader = require("../utilities/VideoLoader");
let RemoteControllerComponent = require("../components/RemoteController");

let settingsManager = new SettingsManager();
let authTokenManager = new AuthTokenManger(new QueryStringReader());
var apiRequester = new ApiRequester(jquery, authTokenManager, scheme, host+":"+port);

const WebSocketSender = require("../utilities/WebSocketSender");
let webSocketSender = new WebSocketSender(host, wsPort);
webSocketSender.setClient(settingsManager.get("playToRemoteClient"));
webSocketSender.connect();

let chromecastManager = new ChromecastManager(apiRequester, authTokenManager, settingsManager, webSocketSender, scheme, host, port);
var episodeLoader = new EpisodeLoader(apiRequester);
let cacheProvider = new CacheProvider(apiRequester);
let showProgressProvider = new ShowProgressProvider(apiRequester, cacheProvider);
let cacheBasedEpisodeProvider = new CacheBasedEpisodeProvider(apiRequester, cacheProvider, showProgressProvider);

var webSocketRemoteController = new WebSocketRemoteController(host, settingsManager.get("myClientName"), wsPort);
var div = document.createElement("div");
div.id = "app";
document.body.appendChild(div);

import LoginProvider from "../utilities/LoginProvider";
let loginProvider = new LoginProvider(apiRequester);
import LoginComponent from "../components/Login";

import ProfileProvider from "../utilities/providers/ProfileProvider";
import ChooseProfile from "../components/ChooseProfile";
let profileProvider = new ProfileProvider(apiRequester);

let CachedBasedSearch = require("../utilities/providers/CacheBasedSearch");
let cacheBasedSearch = new CachedBasedSearch(cacheProvider);

let searchBasedShowProvider = new SearchBasedShowProvider(apiRequester, cacheProvider, showProgressProvider, cacheBasedSearch);

let videoLoader = new VideoLoader(webSocketSender);

window.tvShowSort = function(a, b) {
  if(a.lastIndexOf(".") > -1) {
    a = a.substring(0, a.lastIndexOf("."));
  }
  if(b.lastIndexOf(".") > -1) {
    b = b.substring(0, b.lastIndexOf("."));
  }
  return a.localeCompare(b, undefined, {numeric: true, sensitivity: 'base'});
}

//episodeLoader = searchBasedShowProvider;
render((
  <Router history={hashHistory}>
    <Route path="/" component={(props) => (<Home {...props} videoLoader={videoLoader} settingsManager={settingsManager} webSocketSender={webSocketSender} remoteController={webSocketRemoteController} showProgressProvider={showProgressProvider} cacheProvider={cacheProvider} searcher={cacheBasedSearch} authTokenManager={authTokenManager} />)} >
      <Route path="videos" component={(props) => (<VideosListing {...props} videoLoader={videoLoader} showProgressProvider={showProgressProvider} cacheProvider={cacheProvider} episodeLoader={searchBasedShowProvider}  />)} />
      <Route path="view"component={(props) => (<VideoPlayer {...props} videoLoader={videoLoader} chromecastManager={chromecastManager}  showProgressProvider={showProgressProvider} episodeLoader={episodeLoader} remoteController={webSocketRemoteController} />)} />
      <Route path="login" component={(props) => (<LoginComponent {...props} authTokenManager={authTokenManager} login={loginProvider}  />)} />
      <Route path="profile" component={(props) => (<ChooseProfile {...props} cache={cacheProvider} search={cacheBasedSearch} authTokenManager={authTokenManager} profileProvider={profileProvider}  />)} />
      <Route path="remote" component={(props) => (<RemoteControllerComponent {...props} remote={webSocketSender} />)} />
    </Route>
  </Router>
), div)

window.onerror = function(err) { alert(err); }

webSocketRemoteController.connect();
