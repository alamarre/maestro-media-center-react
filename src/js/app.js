import React from 'react'
import { render } from 'react-dom'
import { Router, Route, Link, hashHistory } from 'react-router'

require("./style.scss");

var Home = require("./components/Home");
var VideoPlayer = require("./components/VideoPlayer");

var div = document.createElement("div");
div.setAttribute("id", "app");
document.body.appendChild(div);

var QueryStringReader = require("./utilities/QueryStringReader");
var queryStringReader = new QueryStringReader();
var AuthTokenManager = require("./utilities/AuthTokenManager");
var authTokenManager = new AuthTokenManager(queryStringReader);

var scheme = "http";
var host = window.location.host;
var ApiRequester = require("./utilities/ApiRequester");
var apiRequester = new ApiRequester(authTokenManager, scheme, host);

var EpisodeLoader = require("./utilities/EpisodeLoader");
var episodeLoader = new EpisodeLoader(apiRequester);

var hostname = window.location.hostname;
var wsPort = window.location.port + 1;

var WebSocketRemoteController;

render((
  <Router history={hashHistory}>
    <Route path="/" component={Home}>
      <Route path="player" component={() => (<VideoPlayer episodeLoader={episodeLoader} />)}>
      </Route>
    </Route>
  </Router>
), document.getElementById('app'))