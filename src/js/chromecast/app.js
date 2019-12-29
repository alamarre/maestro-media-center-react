require("@babel/polyfill");
import React from "react";
import { render, } from "react-dom";
import { Router, Route, hashHistory, } from "react-router";

require("./style.scss");

const host = process.env.HOST;
var scheme = process.env.SCHEME || (window.location.protocol == "http:" ? "http" : "https");
var port = process.env.PORT
  || window.location.port
  || (scheme == "http" ? 80 : 443);
const wsHost = "j5095i3iw3.execute-api.us-east-1.amazonaws.com/main" || process.env.WEBSOCKET_HOST || host;
var wsPort = process.env.WEBSOCKET_PORT || port;
import jquery from "jquery";

import Home from "./ChromecastHome";
import AuthTokenManger from "../utilities/AuthTokenManager";
import SettingsManager from "../utilities/CookiesSettingsManager";
import ApiRequester from "../utilities/ApiRequester";
import QueryStringReader from "../utilities/QueryStringReader";
// import EpisodeLoader from "../utilities/EpisodeLoader";
import WebSocketRemoteController from "../utilities/WebSocketRemoteController";
import CacheProvider from "../utilities/providers/CacheProvider";
import CacheBasedEpisodeProvider from "../utilities/providers/CacheBasedEpisodeProvider";
import ShowProgressProvider from "../utilities/providers/ShowProgressProvider";
import ChromecastListener from "./ChromecastListener";
import VideoPlayer from "../components/VideoPlayer";
import CollectionsManager from "../utilities/CollectionsManager";
import MovieInfoProvider from "../utilities/providers/MovieInfoProvider";

const authTokenManager = new AuthTokenManger(new QueryStringReader(), new SettingsManager());
const apiRequester = new ApiRequester(jquery, authTokenManager, scheme, host + ":" + port);
//const episodeLoader = new EpisodeLoader(apiRequester);
const cacheProvider = new CacheProvider(apiRequester, { noPreload: true, });
import PlaylistProvider from "../utilities/providers/PlaylistProvider";
const playlistProvider = new PlaylistProvider(apiRequester, cacheProvider);
const showProgressProvider = new ShowProgressProvider(apiRequester, cacheProvider);
const movieInfoProvider = new MovieInfoProvider(cacheProvider);
const collectionsManager = new CollectionsManager(apiRequester, movieInfoProvider);
const cacheBasedEpisodeProvider = new CacheBasedEpisodeProvider(apiRequester, cacheProvider, showProgressProvider);

const webSocketRemoteController = new WebSocketRemoteController(wsHost, "Desktop Test Client", wsPort, authTokenManager);

const chromecastListener = new ChromecastListener(apiRequester, authTokenManager, webSocketRemoteController, cacheProvider);
chromecastListener.initialize();

const div = document.createElement("div");
document.body.appendChild(div);

window["tvShowSort"] = function (a, b) {
  if (a.lastIndexOf(".") > -1) {
    a = a.substring(0, a.lastIndexOf("."));
  }
  if (b.lastIndexOf(".") > -1) {
    b = b.substring(0, b.lastIndexOf("."));
  }
  return a.localeCompare(b, undefined, { numeric: true, sensitivity: "base", });
};

import VideoLoader from "../utilities/VideoLoader";
const videoLoader = new VideoLoader();

const episodeProvider = cacheBasedEpisodeProvider;
render((
  <Router history={hashHistory}>
    <Route path="/" component={(props) => (<Home {...props} chromecastListener={chromecastListener} />)} >
      <Route path="view" component={(props) => (<VideoPlayer {...props} playlistManager={playlistProvider} collectionsManager={collectionsManager} videoLoader={videoLoader} isChromecast={true} showProgressProvider={showProgressProvider} episodeLoader={episodeProvider} remoteController={webSocketRemoteController} />)} />
    </Route>
  </Router>
), div);

