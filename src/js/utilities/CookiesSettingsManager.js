class CookieSettingsManager {

  get(name) {
    return this.getCookie(name);
  }

  set(name, value) {
    this.setCookie(name, value, 1000);
  }

  getCookie(cname) {
    if (localStorage) {
      const item = localStorage.getItem(`cookie-${cname}`);
      if (item) {
        try {
          const { value, expires, } = JSON.parse(item);
          if (expires && expires >= (new Date().getTime())) {
            return value;
          }
        } catch (e) {
          console.error(e);
        }
      }
    }
    if (document.cookie === "") {
      const cookie = (localStorage && localStorage.getItem("cookie"));
      if (cookie) {
        document.cookie = cookie;
      }
    }
    var name = cname + "=";
    var ca = document.cookie.split(";");
    for (var i = 0; i < ca.length; i++) {
      var c = ca[i].trim();
      if (c.indexOf(name) == 0) {
        var value = c.substring(name.length, c.length);
        if (value == "null") {
          return "";
        }
        return value;
      }
    }
    return "";
  }

  setCookie(cname, cvalue, exdays) {
    var d = new Date();
    d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
    var expires = "expires=" + d.toGMTString();
    document.cookie = cname + "=" + cvalue + "; " + expires;
    if (localStorage) {
      localStorage.setItem(`cookie-${cname}`, JSON.stringify({ expires: d.getTime(), value: cvalue, }));
    }
  }
}

module.exports = CookieSettingsManager;
