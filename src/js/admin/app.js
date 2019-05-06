require("@babel/polyfill");
const React = require("react");
const { render, } = require("react-dom");
const { Router, Route, hashHistory, } = require("react-router");
const Metadata = require("./components/Metadata");

require("../style.scss");
require("./style.scss");

const host = process.env.HOST;
var scheme = process.env.SCHEME || (window.location.protocol == "http:" ? "http" : "https");
var port = process.env.PORT
  || window.location.port
  || (scheme == "http" ? 80 : 443);
const jquery = require("jquery");

const Home = require("./Home");
const AuthTokenManger = require("../utilities/AuthTokenManager");
const SettingsManager = require("../utilities/CookiesSettingsManager");
const ApiRequester = require("../utilities/ApiRequester");
const QueryStringReader = require("../utilities/QueryStringReader");
// const EpisodeLoader = require("../utilities/EpisodeLoader");

const authTokenManager = new AuthTokenManger(new QueryStringReader(), new SettingsManager());
const apiRequester = new ApiRequester(jquery, authTokenManager, scheme, host + ":" + port);


const LoginProvider = require("../utilities/LoginProvider");
const loginProvider = new LoginProvider(apiRequester);
const LoginComponent = require("../components/Login");

const div = document.createElement("div");
document.body.appendChild(div);

window.tvShowSort = function (a, b) {
  if (a.lastIndexOf(".") > -1) {
    a = a.substring(0, a.lastIndexOf("."));
  }
  if (b.lastIndexOf(".") > -1) {
    b = b.substring(0, b.lastIndexOf("."));
  }
  return a.localeCompare(b, undefined, { numeric: true, sensitivity: "base", });
};

const postLoginFunction = (router) => {
  router.push("/");
};

render((
  <Router history={hashHistory}>
    <Route path="/" component={(props) => (<Home {...props} authTokenManager={authTokenManager} />)} >
      <Route path="metadata" component={(props) => (<Metadata {...props} apiRequester={apiRequester} />)} />
      <Route path="login" component={(props) => (<LoginComponent {...props} authTokenManager={authTokenManager} postLoginFunction={postLoginFunction} login={loginProvider} />)} />
    </Route>
  </Router>
), div);

