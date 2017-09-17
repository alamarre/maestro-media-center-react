class AuthTokenManager {
    constructor(queryStringReader) {
        this.queryStringReader = queryStringReader;
    }

    isAuthenticated() {
        return this.getToken() != "";
    }
    
    getToken() {
        return this.getCookie("access_token");
    }
    
    getCookie(cname)
    {
        var name = cname + "=";
        var ca = document.cookie.split(';');
        for (var i = 0; i < ca.length; i++)
        {
            var c = ca[i].trim();
            if (c.indexOf(name) == 0)
                return c.substring(name.length, c.length);
        }
        return "";
    }
    
    setCookie(cname, cvalue, exdays)
    {
        var d = new Date();
        d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
        var expires = "expires=" + d.toGMTString();
        document.cookie = cname + "=" + cvalue + "; " + expires;
    }

    setToken(token) {
        if (typeof token!="undefined") {
            this.setCookie("access_token", token, 365);
        }
    }
    
    saveToken() {
        var token = this.queryStringReader.getParameter("access_token")
        this.setToken(token);
    }
}

module.exports = AuthTokenManager;