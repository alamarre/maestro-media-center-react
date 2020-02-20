require("@babel/polyfill");
import React from "react";
import { render, } from "react-dom";
import { Route, } from "react-router";
import { HashRouter, } from "react-router-dom";
import Metadata from "./components/Metadata";

require("../style.scss");
require("./style.scss");

const host = process.env.HOST;
var scheme = process.env.SCHEME || (window.location.protocol == "http:" ? "http" : "https");
var port = process.env.PORT
  || window.location.port
  || (scheme == "http" ? 80 : 443);

//const MAIN_HOST = process.env.MAIN_HOST;


import Home from "./Home";
import AuthTokenManger from "../utilities/AuthTokenManager";
import SettingsManager from "../utilities/CookiesSettingsManager";
//import ApiRequester from "../utilities/ApiRequester";
import ApiCaller from "../utilities/providers/ApiCaller";
import QueryStringReader from "../utilities/QueryStringReader";
// import EpisodeLoader from "../utilities/EpisodeLoader";

const authTokenManager = new AuthTokenManger(new QueryStringReader(), new SettingsManager());
//const apiRequester = new ApiRequester(jquery, authTokenManager, scheme, host + ":" + port);
//const mainHostApiCaller = new ApiCaller(authTokenManager, scheme, MAIN_HOST + ":" + port);
const apiCaller = new ApiCaller(authTokenManager, scheme, host + ":" + port);


import LoginProvider from "../utilities/LoginProvider";
const loginProvider = new LoginProvider(apiCaller);
import LoginComponent from "../components/Login";
import Uploader from "./components/Uploader";
import App from "./components/App";

const div = document.createElement("div");
div.className = "app";
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

const postLoginFunction = (history) => {
  history.replace("/");
};

render((
  <HashRouter>
    <Route path="/" component={(props) => (<App {...props} authTokenManager={authTokenManager} />)} />
    <Route exact path="/" component={(props) => (<Home {...props} authTokenManager={authTokenManager} />)} />
    <Route path="/metadata" component={(props) => (<Metadata {...props} apiCaller={apiCaller} />)} />
    <Route path="/upload" component={(props) => (<Uploader {...props} apiCaller={apiCaller} />)} />
    <Route path="/login" component={(props) => (<LoginComponent {...props} authTokenManager={authTokenManager} postLoginFunction={postLoginFunction} login={loginProvider} />)} />

  </HashRouter>
), div);

