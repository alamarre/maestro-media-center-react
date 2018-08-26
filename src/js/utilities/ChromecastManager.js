const chromeCastAppId = process.env.CHROMECAST_APP_ID;

class ChromecastManager {
  constructor(apiRequester, authTokenManager, settingsManager, remoteController, scheme, host, port) {
    this.apiRequester = apiRequester;
    this.authTokenManager = authTokenManager;
    this.settingsManager = settingsManager;
    this.remoteController = remoteController;
    this.host = host;
    this.scheme = scheme;
    this.port = port;
    window.chromecastPromise.then(() => this.initialize(), (err) => {
      console.log("couldn't load chromecast");
    });
  }

  initialize() {
    cast.framework.CastContext.getInstance().setOptions({
      //receiverApplicationId: "C3639C8B",
      ///receiverApplicationId: "D8828ECA",
      receiverApplicationId: chromeCastAppId,
      autoJoinPolicy: chrome.cast.AutoJoinPolicy.ORIGIN_SCOPED,
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
      //var mediaInfo = new chrome.cast.media.MediaInfo("https://chromecast.maestromediacenter.com/nonsense.mp4", 'video/mp4');
      ips = [this.host,].concat(ips);
      //mediaInfo.metadata = new chrome.cast.media.GenericMediaMetadata();
      //mediaInfo.metadata.metadataType = chrome.cast.media.MetadataType.GENERIC;
      //mediaInfo.metadata.title = ;
      const castSession = cast.framework.CastContext.getInstance().getCurrentSession();
      if(castSession) {
        const customData = {
          ips: ips,
          scheme: this.scheme,
          profile: this.authTokenManager.getProfile(),
          token: this.authTokenManager.getToken(),
          port: this.port,
          clientName: castSession.getCastDevice().friendlyName,
        };
        /*
                mediaInfo.customData = customData;
                let request = new chrome.cast.media.LoadRequest(mediaInfo);
                castSession.loadMedia(request).then(() => console.log("loaded"), (err) => {
                    console.log(err);
                });*/
        const CUSTOM_CHANNEL = "urn:x-cast:com.maestromediacenter";
        castSession.sendMessage(CUSTOM_CHANNEL, customData, () => {console.log("sent");}, (err) => { console.log(err);});
        this.settingsManager.set("playToRemoteClient", castSession.getCastDevice().friendlyName);
        this.remoteController.setClient(castSession.getCastDevice().friendlyName);
      }
    });
  }

  playVideo(url, folder, episodeIndex, type) {
    this.apiRequester.apiRequestPromise("server", "ips", {}).then((ips) => {
      var mediaInfo = new chrome.cast.media.MediaInfo(url, "video/mp4");
            
      //mediaInfo.metadata = new chrome.cast.media.GenericMediaMetadata();
      //mediaInfo.metadata.metadataType = chrome.cast.media.MetadataType.GENERIC;
      //mediaInfo.metadata.title = ;
      const castSession = cast.framework.CastContext.getInstance().getCurrentSession();
      mediaInfo.customData = {
        ips: ips,
        scheme: scheme,
        port: port,
        type: type,
        folder: folder,
        clientName: castSession.receiver.friendlyName,
        episodeIndex: episodeIndex,
      };

      const request = new chrome.cast.media.LoadRequest(mediaInfo);
      castSession.loadMedia(request).then(() => console.log("loaded"));
    });
  }

  isConnected() {
    return this.remotePlayer.isConnected;
  }
}

module.exports = ChromecastManager;