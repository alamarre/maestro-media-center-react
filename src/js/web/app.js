//const 'bootstrap';
require("@babel/polyfill");
require("font-awesome/scss/font-awesome.scss");
require("bootstrap");
const React = require("react");
const { render, } = require("react-dom");
const { Router, Route, hashHistory, } = require("react-router");

require("../style.scss");

var host = process.env.HOST || window.location.hostname;

// this could also have been done with substring, but was simple
var scheme = process.env.SCHEME || (window.location.protocol == "http:" ? "http" : "https");
var port = process.env.PORT
  || window.location.port
  || (scheme == "http" ? 80 : 443);
const wsHost = process.env.WEBSOCKET_HOST || host;
var wsPort = process.env.WEBSOCKET_PORT || port;
var jquery = require("jquery");

var Home = require("../components/Home");

var VideoPlayer = require("../components/VideoPlayer");
var VideosListing = require("../components/VideosListing");
var AuthTokenManger = require("../utilities/AuthTokenManager");
var ApiRequester = require("../utilities/ApiRequester");
var QueryStringReader = require("../utilities/QueryStringReader");
var EpisodeLoader = require("../utilities/EpisodeLoader");
var WebSocketRemoteController = require("../utilities/WebSocketRemoteController");
const AccountProvider = require("../utilities/providers/AccountProvider");
const CacheProvider = require("../utilities/providers/CacheProvider");
const CacheBasedEpisodeProvider = require("../utilities/providers/CacheBasedEpisodeProvider");
const SearchBasedShowProvider = require("../utilities/providers/SearchBasedShowProvider");
const ShowProgressProvider = require("../utilities/providers/ShowProgressProvider");
const ChromecastManager = require("../utilities/ChromecastManager");
const SettingsManager = require("../utilities/CookiesSettingsManager");
const VideoLoader = require("../utilities/VideoLoader");
const RemoteControllerComponent = require("../components/RemoteController");
const CollectionsManager = require("../utilities/CollectionsManager");
const MovieInfoProvider = require("../utilities/providers/MovieInfoProvider");
const OfflineStorage = require("../utilities/OfflineVideoStorage");
const CordovaOfflineStorage = require("../utilities/CordovaOfflineVideoStorage");
const OfflineVideos = require("../components/OfflineVideos");

const KeyboardNavigation = require("../utilities/providers/navigation/KeyboardNavigation");
const keyboardNavigation = new KeyboardNavigation();

const settingsManager = new SettingsManager();
const authTokenManager = new AuthTokenManger(new QueryStringReader(), settingsManager);
var apiRequester = new ApiRequester(jquery, authTokenManager, scheme, host + ":" + port);
const accountProvider = new AccountProvider(apiRequester);

const WebSocketSender = require("../utilities/WebSocketSender");
const webSocketSender = new WebSocketSender(wsHost, wsPort, authTokenManager);
webSocketSender.setClient(settingsManager.get("playToRemoteClient"));
webSocketSender.connect();

const chromecastManager = new ChromecastManager(apiRequester, authTokenManager, settingsManager, webSocketSender, scheme, host, port);
var episodeLoader = new EpisodeLoader(apiRequester);
const cacheProvider = new CacheProvider(apiRequester);
const showProgressProvider = new ShowProgressProvider(apiRequester, cacheProvider);
const cacheBasedEpisodeProvider = new CacheBasedEpisodeProvider(apiRequester, cacheProvider, showProgressProvider);

var webSocketRemoteController = new WebSocketRemoteController(wsHost, settingsManager.get("myClientName"), wsPort, authTokenManager);
var div = document.createElement("div");
div.id = "app";
document.body.appendChild(div);

const LoginProvider = require("../utilities/LoginProvider");
const loginProvider = new LoginProvider(apiRequester);
const LoginComponent = require("../components/Login");

const ProfileProvider = require("../utilities/providers/ProfileProvider");
const ChooseProfile = require("../components/ChooseProfile");
const profileProvider = new ProfileProvider(apiRequester);

const PlaylistProvider = require("../utilities/providers/PlaylistProvider");
const playlistProvider = new PlaylistProvider(apiRequester, cacheProvider);

const CachedBasedSearch = require("../utilities/providers/CacheBasedSearch");
const cacheBasedSearch = new CachedBasedSearch(cacheProvider, playlistProvider);

const searchBasedShowProvider = new SearchBasedShowProvider(apiRequester, cacheProvider, showProgressProvider, cacheBasedSearch);

const movieInfoProvider = new MovieInfoProvider(cacheProvider);
const collectionsManager = new CollectionsManager(apiRequester, movieInfoProvider);

const NewMoviesProvider = require("../utilities/providers/NewMoviesProvider");
const newMoviesProvider = new NewMoviesProvider(apiRequester, cacheProvider);

const cordovaOfflineStorage = new CordovaOfflineStorage(cacheBasedEpisodeProvider);
const offlineStorage = cordovaOfflineStorage.canStoreOffline() ?
  cordovaOfflineStorage :
  new OfflineStorage(cacheBasedEpisodeProvider);

const videoLoader = new VideoLoader(webSocketSender);

window.tvShowSort = function (a, b) {
  if (a.lastIndexOf(".") > -1) {
    a = a.substring(0, a.lastIndexOf("."));
  }
  if (b.lastIndexOf(".") > -1) {
    b = b.substring(0, b.lastIndexOf("."));
  }
  return a.localeCompare(b, undefined, { numeric: true, sensitivity: "base", });
};

const imageRoot = "https://maestro-images.omny.ca";

const MetadataProvider = require("../utilities/providers/MetadataProvider");
const metadataProvider = new MetadataProvider(apiRequester);

episodeLoader = cacheBasedEpisodeProvider;
render((
  <Router history={hashHistory}>
    <Route path="/" component={(props) => (<Home {...props} navigation={keyboardNavigation} accountProvider={accountProvider} newMoviesProvider={newMoviesProvider} offlineStorage={offlineStorage} metadataProvider={metadataProvider} episodeLoader={cacheBasedEpisodeProvider} playlistManager={playlistProvider} collectionsManager={collectionsManager} imageRoot={imageRoot} videoLoader={videoLoader} settingsManager={settingsManager} webSocketSender={webSocketSender} remoteController={webSocketRemoteController} showProgressProvider={showProgressProvider} cacheProvider={cacheProvider} searcher={cacheBasedSearch} authTokenManager={authTokenManager} />)} >
      <Route path="videos(/:videoType)" component={(props) => (<VideosListing {...props} navigation={keyboardNavigation} offlineStorage={offlineStorage} metadataProvider={metadataProvider} imageRoot={imageRoot} videoLoader={videoLoader} playlistManager={playlistProvider} showProgressProvider={showProgressProvider} cacheProvider={cacheProvider} episodeLoader={searchBasedShowProvider} />)} />
      <Route path="view" component={(props) => (<VideoPlayer {...props} navigation={keyboardNavigation} offlineStorage={offlineStorage} playlistManager={playlistProvider} collectionsManager={collectionsManager} videoLoader={videoLoader} chromecastManager={chromecastManager} showProgressProvider={showProgressProvider} episodeLoader={episodeLoader} remoteController={webSocketRemoteController} />)} />
      <Route path="login" component={(props) => (<LoginComponent {...props} navigation={keyboardNavigation} authTokenManager={authTokenManager} login={loginProvider} />)} />
      <Route path="profile" component={(props) => (<ChooseProfile {...props} navigation={keyboardNavigation} cache={cacheProvider} search={cacheBasedSearch} authTokenManager={authTokenManager} profileProvider={profileProvider} />)} />
      <Route path="remote" component={(props) => (<RemoteControllerComponent {...props} navigation={keyboardNavigation} remote={webSocketSender} />)} />
      <Route path="offline" component={(props) => (<OfflineVideos {...props} navigation={keyboardNavigation} imageRoot={imageRoot} offlineStorage={offlineStorage} videoLoader={videoLoader} />)} />
    </Route>
  </Router>
), div);

webSocketRemoteController.connect();
