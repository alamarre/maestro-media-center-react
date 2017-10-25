class ChromecastManager {
    constructor(apiRequester, authTokenManager, scheme, port) {
        this.apiRequester = apiRequester;
        this.authTokenManager = authTokenManager;
        this.scheme = scheme;
        this.port = port;
        window.chromecastPromise.then(() => this.initialize());
    }

    initialize() {
        cast.framework.CastContext.getInstance().setOptions({
            //receiverApplicationId: "C3639C8B",
            receiverApplicationId: "D8828ECA",
            autoJoinPolicy: chrome.cast.AutoJoinPolicy.ORIGIN_SCOPED
        });

        this.remotePlayer = new cast.framework.RemotePlayer();
        this.remotePlayerController = new cast.framework.RemotePlayerController(this.remotePlayer);
        this.remotePlayerController.addEventListener(
            cast.framework.RemotePlayerEventType.IS_CONNECTED_CHANGED,
            () => this.connect()
        );
    }

    connect() {
        this.apiRequester.apiRequestPromise("server", "ips", {}).then((ips) => {
            var mediaInfo = new chrome.cast.media.MediaInfo("http://fake.com", 'video/mp4');
            
            //mediaInfo.metadata = new chrome.cast.media.GenericMediaMetadata();
            //mediaInfo.metadata.metadataType = chrome.cast.media.MetadataType.GENERIC;
            //mediaInfo.metadata.title = ;
            let castSession = cast.framework.CastContext.getInstance().getCurrentSession();
            mediaInfo.customData = {
                ips: ips,
                scheme: this.scheme,
                profile: this.authTokenManager.getProfile(),
                token: this.authTokenManager.getToken(),
                port: this.port,
                clientName: castSession.getCastDevice().friendlyName
            };

            let request = new chrome.cast.media.LoadRequest(mediaInfo);
            castSession.loadMedia(request).then(() => console.log("loaded"));
        });
    }

    playVideo(url, folder, episodeIndex, type) {
        this.apiRequester.apiRequestPromise("server", "ips", {}).then((ips) => {
            var mediaInfo = new chrome.cast.media.MediaInfo(url, 'video/mp4');
            
            //mediaInfo.metadata = new chrome.cast.media.GenericMediaMetadata();
            //mediaInfo.metadata.metadataType = chrome.cast.media.MetadataType.GENERIC;
            //mediaInfo.metadata.title = ;
            let castSession = cast.framework.CastContext.getInstance().getCurrentSession();
            mediaInfo.customData = {
                ips: ips,
                scheme: scheme,
                port: port,
                type: type,
                folder: folder,
                clientName: castSession.receiver.friendlyName,
                episodeIndex: episodeIndex
            };

            let request = new chrome.cast.media.LoadRequest(mediaInfo);
            castSession.loadMedia(request).then(() => console.log("loaded"));
        });
    }

    isConnected() {
        return this.remotePlayer.isConnected;
    }
}

module.exports = ChromecastManager;