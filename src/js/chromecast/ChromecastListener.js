class ChromecastListener {
  constructor(apiRequester, authTokenManager, webSocketRemoteController, cache) {
    this.apiRequester = apiRequester;
    this.authTokenManager = authTokenManager;
    this.cache = cache;
    this.webSocketRemoteController = webSocketRemoteController;
  }

  initialize() {
    const context = cast.framework.CastReceiverContext.getInstance();
    const options = new cast.framework.CastReceiverOptions();
    options.maxInactivity = 20;
        
    const player = context.getPlayerManager();

    const CUSTOM_CHANNEL = "urn:x-cast:com.maestromediacenter";
    context.addCustomMessageListener(CUSTOM_CHANNEL, (customEvent) => {
      const data = customEvent.data;

      this.authTokenManager.setProfile(data.profile);
      this.authTokenManager.setToken(data.token);
      this.getValidServerUrl(data.ips, data.scheme, data.port)
        .then((response) =>{
          const host = response.host;
          this.apiRequester.updateSettings(data.scheme, host+":"+data.port);
          this.webSocketRemoteController.updateSettings(host, data.clientName, data.port);
          this.webSocketRemoteController.connect();
          this.cache.reload();

          const connectedEvent = new CustomEvent("server-connected", {detail: {"clientName": data.clientName, "ip": response.ip,},});
          document.dispatchEvent(connectedEvent);
        });
    });

    /*player.setMessageInterceptor(
        cast.framework.messages.MessageType.LOAD,
        request => {
            return new Promise((resolve, reject) => {
                let data = request.media.customData;
                
                    resolve(request);
                }, reject);
                
            });
        });

        player.setMessageInterceptor(
            cast.framework.messages.MessageType.MEDIA_STATUS,
            status => {
            status.customData = {};
            return status;
        });*/

    context.start(options);
  }

  getValidServerUrl(serverUrls, scheme, port) {
    return new Promise((s,f) => {
      const currentServerUrl = serverUrls.shift();
      if(scheme.indexOf(":")==-1) {
        scheme +=":";
      }

      const self = this;

      $.ajax({
        url : scheme + "//" + currentServerUrl + ":" + port + "/health",
        success : function (response) {
          if(typeof response == "string") {
            response = JSON.parse(response);
          }
          s({host: currentServerUrl, ip: response.clientIp,});
        },
        error : function () {
          if(serverUrls.length==0) {
            f();
          }
          self.getValidServerUrl(serverUrls, scheme, port).then(s, f);
        },
      });
    });
  }
}

module.exports = ChromecastListener;