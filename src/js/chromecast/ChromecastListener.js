class ChromecastListener {
    constructor(apiRequester, authTokenManager, webSocketRemoteController) {
        this.apiRequester = apiRequester;
        this.authTokenManager = authTokenManager;
        this.webSocketRemoteController = webSocketRemoteController;
    }

    initialize() {
        const context = cast.framework.CastReceiverContext.getInstance();
        const player = context.getPlayerManager();

        player.setMessageInterceptor(
        cast.framework.messages.MessageType.LOAD,
        request => {
            return new Promise((resolve, reject) => {
                let data = request.media.customData;
                this.authTokenManager.setProfile(data.profile);
                this.authTokenManager.setToken(data.token);
                this.getValidServerUrl(data.ips, data.scheme, data.port)
                .then((host, clientIp) =>{
                    this.apiRequester.updateSettings(data.scheme, host+":"+data.port);
                    this.webSocketRemoteController.updateSettings(host, data.clientName, data.port);
                    this.webSocketRemoteController.connect();

                    let connectedEvent = new CustomEvent("server-connected", {"clientName": data.clientName, "ip": clientIp})
                    document.dispatchEvent(connectedEvent);
                    resolve(request);
                }, reject);
                
            });
        });

        player.setMessageInterceptor(
            cast.framework.messages.MessageType.MEDIA_STATUS,
            status => {
            status.customData = {};
            return status;
        });

        context.start();
    }

    getValidServerUrl(serverUrls, scheme, port) {
        return new Promise((s,f) => {
            let currentServerUrl = serverUrls.shift();
            if(scheme.indexOf(":")==-1) {
                scheme +=":";
            }

            $.ajax({
                url : scheme + "//" + currentServerUrl + ":" + port + "/health",
                success : function (response) {
                    if(typeof response == "string") {
                        response = JSON.parse(response);
                    }
                    s(currentServerUrl, response.clientIp);
                },
                error : function () {
                    if(serverUrls.length==0) {
                        f();
                    }
                    this.getValidServerUrl(serverUrls, scheme).then(s, f);
                }
            });
        });
    }
}

module.exports = ChromecastListener;