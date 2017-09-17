import React from 'react'
import { render } from 'react-dom'
import { Router, Route, Link, hashHistory } from 'react-router'

require("./style.scss");

var host = "localhost";
var scheme = "http";
var port = 3000;
var wsPort = port+1;
var jquery = require("jquery");

var Home = require("./components/Home");
var VideoPlayer = require("./components/VideoPlayer");
var VideosListing = require("./components/VideosListing");
var AuthTokenManger = require("./utilities/AuthTokenManager");
var ApiRequester = require("./utilities/ApiRequester");
var QueryStringReader = require("./utilities/QueryStringReader");
var EpisodeLoader = require("./utilities/EpisodeLoader");
var WebSocketRemoteController = require("./utilities/WebSocketRemoteController");

let authTokenManager = new AuthTokenManger(new QueryStringReader());
var apiRequester = new ApiRequester(jquery, authTokenManager, scheme, host+":"+port);
var episodeLoader = new EpisodeLoader(apiRequester);
var webSocketRemoteController = new WebSocketRemoteController(host, "Desktop Test Client", wsPort);
var div = document.createElement("div");
document.body.appendChild(div);

import LoginProvider from "./utilities/LoginProvider";
let loginProvider = new LoginProvider(apiRequester);
import LoginComponent from "./components/Login";

render((
  <Router history={hashHistory}>
    <Route path="/" component={(props) => (<Home {...props} authTokenManager={authTokenManager} />)} >
      <Route path="videos" component={(props) => (<VideosListing {...props} episodeLoader={episodeLoader}  />)} />
      <Route path="view" component={(props) => (<VideoPlayer {...props} episodeLoader={episodeLoader} remoteController={webSocketRemoteController} />)} />
      <Route path="login" component={(props) => (<LoginComponent {...props} authTokenManager={authTokenManager} login={loginProvider}  />)} />
    </Route>
  </Router>
), div)

webSocketRemoteController.connect()
