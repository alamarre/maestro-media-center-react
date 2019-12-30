//const 'bootstrap';
require("@babel/polyfill");
require("font-awesome/scss/font-awesome.scss");
require("bootstrap");
import React from "react";
import { render, } from "react-dom";
import { Router, Route, hashHistory, } from "react-router";

require("./clipboard");
require("../style.scss");

var host = process.env.HOST || window.location.hostname;

// this could also have been done with substring, but was simple
var scheme = process.env.SCHEME || (window.location.protocol == "http:" ? "http" : "https");
var port = process.env.PORT
  || window.location.port
  || (scheme == "http" ? "80" : "443");
const wsHost = "j5095i3iw3.execute-api.us-east-1.amazonaws.com/main" || process.env.WEBSOCKET_HOST || host;
const wsPortString = process.env.WEBSOCKET_PORT || port;
const wsPort = parseInt(wsPortString);

import App from "../components/App";

import VideoPlayer from "../components/VideoPlayer";
import VideosListing from "../components/VideosListing";

import Settings from "../components/Settings";

import AuthTokenManger from "../utilities/AuthTokenManager";
import ApiCaller from "../utilities/providers/ApiCaller";
import dataProviderFactory from "../utilities/providers/data";
import QueryStringReader from "../utilities/QueryStringReader";
import WebSocketRemoteController from "../utilities/WebSocketRemoteController";
import AccountProvider from "../utilities/providers/AccountProvider";
import CacheProvider from "../utilities/providers/CacheProvider";
import CacheBasedEpisodeProvider from "../utilities/providers/CacheBasedEpisodeProvider";
import SearchBasedShowProvider from "../utilities/providers/SearchBasedShowProvider";
import ShowProgressProvider from "../utilities/providers/ShowProgressProvider";
import SettingsManager from "../utilities/CookiesSettingsManager";
import VideoLoader from "../utilities/VideoLoader";
import RemoteControllerComponent from "../components/RemoteController";
import CollectionsManager from "../utilities/CollectionsManager";
import HomepageCollectionManager from "../utilities/HomepageCollectionManager";
import MovieInfoProvider from "../utilities/providers/MovieInfoProvider";
import OfflineStorage from "../utilities/OfflineVideoStorage";
import CordovaOfflineStorage from "../utilities/CordovaOfflineVideoStorage";
import OfflineVideos from "../components/OfflineVideos";

import KeyboardNavigation from "../utilities/providers/navigation/KeyboardNavigation";
const keyboardNavigation = new KeyboardNavigation();

const settingsManager = new SettingsManager();
const authTokenManager = new AuthTokenManger(new QueryStringReader(), settingsManager);

const apiCaller = new ApiCaller(authTokenManager, scheme, host + ":" + port);
const dataProviders = dataProviderFactory(apiCaller);
const accountProvider = new AccountProvider(apiCaller);

import WebSocketSender from "../utilities/WebSocketSender";
const webSocketSender = new WebSocketSender(wsHost, wsPort, authTokenManager);
webSocketSender.setClient(settingsManager.get("playToRemoteClient"));
webSocketSender.connect();

const cacheProvider = new CacheProvider(apiCaller);
const showProgressProvider = new ShowProgressProvider(apiCaller, cacheProvider);
const cacheBasedEpisodeProvider = new CacheBasedEpisodeProvider(apiCaller, cacheProvider, showProgressProvider);

var webSocketRemoteController = new WebSocketRemoteController(wsHost, settingsManager.get("myClientName"), wsPort, authTokenManager);
var div = document.createElement("div");
div.id = "app";
document.body.appendChild(div);

import LoginProvider from "../utilities/LoginProvider";
const loginProvider = new LoginProvider(apiCaller);
import LoginComponent from "../components/Login";

import ProfileProvider from "../utilities/providers/ProfileProvider";
import ChooseProfile from "../components/ChooseProfile";
const profileProvider = new ProfileProvider(apiCaller);

import PlaylistProvider from "../utilities/providers/PlaylistProvider";
const playlistProvider = new PlaylistProvider(apiCaller, cacheProvider);

import CachedBasedSearch from "../utilities/providers/CacheBasedSearch";
const cacheBasedSearch = new CachedBasedSearch(cacheProvider, playlistProvider);

const searchBasedShowProvider = new SearchBasedShowProvider(apiCaller, cacheProvider, showProgressProvider, cacheBasedSearch);

const movieInfoProvider = new MovieInfoProvider(cacheProvider);
const collectionsManager = new CollectionsManager(apiCaller, movieInfoProvider);

const homepageCollectionManager = new HomepageCollectionManager(apiCaller);

import NewMoviesProvider from "../utilities/providers/NewMoviesProvider";
const newMoviesProvider = new NewMoviesProvider(apiCaller, cacheProvider);

const cordovaOfflineStorage = new CordovaOfflineStorage(cacheBasedEpisodeProvider);
const offlineStorage = cordovaOfflineStorage.canStoreOffline() ?
  cordovaOfflineStorage :
  new OfflineStorage();

const videoLoader = new VideoLoader(webSocketSender);

window["tvShowSort"] = function (a, b) {
  if (a.lastIndexOf(".") > -1) {
    a = a.substring(0, a.lastIndexOf("."));
  }
  if (b.lastIndexOf(".") > -1) {
    b = b.substring(0, b.lastIndexOf("."));
  }
  return a.localeCompare(b, undefined, { numeric: true, sensitivity: "base", });
};

const imageRoot = "https://maestro-images.omny.ca";

import MetadataProvider from "../utilities/providers/MetadataProvider";
const metadataProvider = new MetadataProvider(apiCaller);

const episodeLoader = cacheBasedEpisodeProvider;
render((
  <Router history={hashHistory}>
    <Route path="/" component={(props) => (<App {...props} dataProviders={dataProviders} homepageCollectionManager={homepageCollectionManager} navigation={keyboardNavigation} accountProvider={accountProvider} newMoviesProvider={newMoviesProvider} offlineStorage={offlineStorage} metadataProvider={metadataProvider} episodeLoader={cacheBasedEpisodeProvider} playlistManager={playlistProvider} collectionsManager={collectionsManager} imageRoot={imageRoot} videoLoader={videoLoader} settingsManager={settingsManager} webSocketSender={webSocketSender} remoteController={webSocketRemoteController} showProgressProvider={showProgressProvider} cacheProvider={cacheProvider} searcher={cacheBasedSearch} authTokenManager={authTokenManager} />)} >
      <Route path="videos(/:videoType)" component={(props) => (<VideosListing {...props} navigation={keyboardNavigation} offlineStorage={offlineStorage} metadataProvider={metadataProvider} imageRoot={imageRoot} videoLoader={videoLoader} playlistManager={playlistProvider} showProgressProvider={showProgressProvider} cacheProvider={cacheProvider} episodeLoader={searchBasedShowProvider} />)} />
      <Route path="view" component={(props) => (<VideoPlayer {...props} navigation={keyboardNavigation} offlineStorage={offlineStorage} playlistManager={playlistProvider} collectionsManager={collectionsManager} videoLoader={videoLoader} showProgressProvider={showProgressProvider} episodeLoader={episodeLoader} remoteController={webSocketRemoteController} />)} />
      <Route path="login" component={(props) => (<LoginComponent {...props} navigation={keyboardNavigation} authTokenManager={authTokenManager} login={loginProvider} />)} />
      <Route path="profile" component={(props) => (<ChooseProfile {...props} serverProvider={cacheBasedEpisodeProvider} navigation={keyboardNavigation} cache={cacheProvider} search={cacheBasedSearch} authTokenManager={authTokenManager} profileProvider={profileProvider} />)} />
      <Route path="remote" component={(props) => (<RemoteControllerComponent {...props} navigation={keyboardNavigation} remote={webSocketSender} />)} />
      <Route path="offline" component={(props) => (<OfflineVideos {...props} navigation={keyboardNavigation} imageRoot={imageRoot} offlineStorage={offlineStorage} videoLoader={videoLoader} />)} />
      <Route path="settings" component={(props) => (<Settings {...props} navigation={keyboardNavigation} settingsManager={settingsManager} webSocketSender={webSocketSender} remoteController={webSocketRemoteController} />)} />
    </Route>
  </Router>
), div);

webSocketRemoteController.connect();
