const cast = window.cast;

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

    const CUSTOM_CHANNEL = "urn:x-cast:com.maestromediacenter";
    context.addCustomMessageListener(CUSTOM_CHANNEL, (customEvent) => {
      const data = customEvent.data;

      this.authTokenManager.setProfile(data.profile);
      this.authTokenManager.setToken(data.token);
      var host = process.env.HOST || window.location.hostname;

      // this could also have been done with substring, but was simple
      var scheme = process.env.SCHEME || (window.location.protocol == "http:" ? "http" : "https");
      var port = process.env.PORT
        || window.location.port
        || (scheme == "http" ? 80 : 443);
      const wsHost = process.env.WEBSOCKET_HOST || host;
      var wsPort = process.env.WEBSOCKET_PORT || port;
      this.apiRequester.updateSettings(scheme, host+":"+port);
      this.webSocketRemoteController.updateSettings(wsHost, data.clientName, wsPort);
      this.webSocketRemoteController.connect();
      this.cache.reload();

      const connectedEvent = new CustomEvent("server-connected", {detail: {"clientName": data.clientName, "ip": host,},});
      document.dispatchEvent(connectedEvent);
    });

    context.start(options);
  }
}

module.exports = ChromecastListener;