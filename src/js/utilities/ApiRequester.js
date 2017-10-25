class ApiRequester {
    constructor(jQuery, authTokenManager, scheme, host) {
        this.authTokenManager = authTokenManager;
        this.scheme = scheme || "http";
        this.host = host;
        this.jQuery = jQuery;
    }

    updateSettings(host, scheme) {
        this.host = host;
        this.scheme = scheme;
    }

    getHost() {
        return this.scheme + "://" + this.host;
    }

    ajaxRequest(request) {
        var url = request.url;
        if(this.host != null) {
            url = this.scheme + "://" + this.host + url;
        }
    var requestInfo = {
        url: url,
        type: "GET",
        success: function(data) {
            if (typeof data == "string") {
                try {
                    data = JSON.parse(data);
                } catch (error) {

                }
            }
            
            request.success(data);
            
        }, error: function(data, t, e) {
            if (typeof request.error == "function") {
                request.error(data);
            } else {
                //alert("An error has occurred");
            }
        }
    };

    if (typeof request.data != "undefined") {
        requestInfo.data = request.data;
    }
    if (typeof request.type != "undefined") {
        requestInfo.type = request.type;
    }
    if (typeof request.processData != "undefined") {
        requestInfo.processData = request.processData;
    }
    if (typeof request.contentType != "undefined") {
        requestInfo.contentType = request.contentType;
    }            

    this.jQuery.ajax(requestInfo);
}

apiRequestPromise(module, path, request, version) {
    var authTokenManager = this.authTokenManager;
    var self = this;
    var promise = new Promise(function (fulfill, reject) {
        var url = "/api/v1.0/" + module;
        if(path!="") {
            url +="/"+path;
        }
        if (url.indexOf("?") == -1) {
            url += "?access_token=" + authTokenManager.getToken();
        } else {
            url += "&access_token=" + authTokenManager.getToken();
        }

        if(authTokenManager.isProfileSet()) {
            url += "&profile=" + authTokenManager.getProfile();
        }
        
        request.url = url;
        request.success = function() {
            fulfill.apply(this, arguments);
        };
        request.error=function() {
            reject.apply(this, arguments);
        }
        self.ajaxRequest(request);
    });
    return promise;
  }
}

module.exports = ApiRequester;

