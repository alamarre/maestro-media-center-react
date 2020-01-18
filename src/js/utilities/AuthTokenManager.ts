import ICookieManager from "./ICookieManager";
import IQueryStringReader from "./IQueryStringReader";


export default class AuthTokenManager {
  private queryStringReader: IQueryStringReader;
  private cookieManager: ICookieManager;

  constructor(queryStringReader, cookieManager) {
    this.queryStringReader = queryStringReader;
    this.cookieManager = cookieManager;
  }

  isAuthenticated() {
    const token = this.getToken();
    return token && token !== "null";
  }

  getCookie(cname) {
    return this.cookieManager.getCookie(cname);
  }

  setCookie(cname, cvalue, exdays) {
    return this.cookieManager.setCookie(cname, cvalue, exdays);
  }

  getToken() {
    return this.getCookie("access_token");
  }

  setToken(token) {
    if (typeof token != "undefined") {
      this.setCookie("access_token", token, 365);
    }
  }

  isProfileSet() {
    return this.getProfile() != "";
  }

  getProfile() {
    //return this.profile;
    const loc = window.location.hash.indexOf("?");
    if (loc > -1) {
      const query = window.location.hash.substring(loc);
      const urlParams = new URLSearchParams(query);
      if (urlParams.has("profile") && urlParams.get("profile")) {
        return urlParams.get("profile");
      }
    }
    return this.getCookie("user_profile");
  }

  setProfile(profile) {
    //this.profile = profile;
    if (typeof profile != "undefined") {
      this.setCookie("user_profile", profile, 365);
    }
  }

  saveToken() {
    var token = this.queryStringReader.getParameter("access_token");
    this.setToken(token);
  }
}


