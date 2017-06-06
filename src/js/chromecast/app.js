import React from 'react'
import { render } from 'react-dom'
import { Router, Route, Link, hashHistory } from 'react-router'

require("./style.scss");

var host = "192.168.0.21";
var scheme = "http";
var port = 8080;
var wsPort = port+1;
var jquery = require("jquery");

var VideoPlayer = require("../components/VideoPlayer");
var AuthTokenManger = require("../utilities/AuthTokenManager");
var ApiRequester = require("../utilities/ApiRequester");
var QueryStringReader = require("../utilities/QueryStringReader");
var EpisodeLoader = require("../utilities/EpisodeLoader");
var WebSocketRemoteController = require("../utilities/WebSocketRemoteController");

var apiRequester = new ApiRequester(jquery, new AuthTokenManger(new QueryStringReader()), scheme, host+":"+port);
var episodeLoader = new EpisodeLoader(apiRequester);
var webSocketRemoteController = new WebSocketRemoteController(host, "Desktop Test Client", wsPort);
var div = document.createElement("div");
document.body.appendChild(div);

render((
  <Router history={hashHistory}>
    <Route path="/" component={() => (<VideoPlayer episodeLoader={episodeLoader} remoteController={webSocketRemoteController} />)} />
  </Router>
), div)

webSocketRemoteController.connect()