require("@babel/polyfill");
import React from "react";
import { render, } from "react-dom";
import { Route, } from "react-router";
import { HashRouter, } from "react-router-dom";
import Metadata from "./components/Metadata";
import CustomizeMetadata from "./components/CustomizeMetadata";

//require("../style.scss");
require("./style.css");

const host = process.env.HOST;
var scheme = process.env.SCHEME || (window.location.protocol == "http:" ? "http" : "https");
var port = process.env.PORT
  || window.location.port
  || (scheme == "http" ? 80 : 443);

const MAIN_HOST = process.env.MAIN_HOST;


import Home from "./Home";
import AuthTokenManger from "../utilities/AuthTokenManager";
import SettingsManager from "../utilities/CookiesSettingsManager";
//import ApiRequester from "../utilities/ApiRequester";
import ApiCaller from "../utilities/providers/ApiCaller";
import QueryStringReader from "../utilities/QueryStringReader";
// import EpisodeLoader from "../utilities/EpisodeLoader";

const authTokenManager = new AuthTokenManger(new QueryStringReader(), new SettingsManager());
//const apiRequester = new ApiRequester(jquery, authTokenManager, scheme, host + ":" + port);
const mainHostApiCaller = new ApiCaller(authTokenManager, scheme, MAIN_HOST + ":" + port);
const apiCaller = new ApiCaller(authTokenManager, scheme, host + ":" + port);


import LoginProvider from "../utilities/LoginProvider";
const loginProvider = new LoginProvider(apiCaller);
import LoginComponent from "../components/Login";
import Uploader from "./components/Uploader";
import App from "./components/App";
import AccountProvider from "../utilities/providers/AccountProvider";

const div = document.createElement("div");
div.className = "app";
document.body.appendChild(div);

function stripExtension(file: string) {
  if (file.lastIndexOf(".") > -1) {
    const extension = file.substring(file.lastIndexOf(".")+1);
    if(extension.match(/^[a-zA-Z0-9]{2,4}$/)) {
      return file.substring(0, file.lastIndexOf("."));
    }
  }
  return file;
}

window["tvShowSort"] = function (a: string, b: string) {
  a = stripExtension(a);
  b = stripExtension(b);
  return a.localeCompare(b, undefined, { numeric: true, sensitivity: "base", });
};

const postLoginFunction = (history) => {
  history.replace("/");
};

const accountProvider = new AccountProvider(mainHostApiCaller);

render((
  <HashRouter>
    <Route path="/" component={(props) => (<App {...props} authTokenManager={authTokenManager} accountProvider={accountProvider} />)} />
    <Route exact path="/" component={(props) => (<Home {...props} authTokenManager={authTokenManager} />)} />
    <Route path="/metadata" component={(props) => (<Metadata {...props} apiCaller={apiCaller} />)} />
    <Route path="/custom-metadata" component={(props) => (<CustomizeMetadata {...props} apiCaller={apiCaller} />)} />
    <Route path="/upload" component={(props) => (<Uploader {...props} apiCaller={apiCaller} userApiCaller={mainHostApiCaller} />)} />
    <Route path="/login" component={(props) => (<LoginComponent {...props} authTokenManager={authTokenManager} postLoginFunction={postLoginFunction} login={loginProvider} />)} />

  </HashRouter>
), div);

