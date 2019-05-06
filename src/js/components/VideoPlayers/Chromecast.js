const React = require("react");
const cast = window.cast;
class ChromecastPlayer extends React.Component {
  constructor(props) {
    super(props);
    if (this.props.remoteController) {
      this.props.remoteController.mapPartialUpdateFunctions({
        play: this.play.bind(this),
        pause: this.pause.bind(this),
        skipForward: this.skipForward.bind(this),
        skipBack: this.skipBack.bind(this),
        seek: this.seek.bind(this),
      });
    }
  }

  componentDidMount() {
    const context = cast.framework.CastReceiverContext.getInstance();
    const player = context.getPlayerManager();
    player.addEventListener(cast.framework.events.EventType.PLAY,
      () => {
        this.props.onPlay(this);
      });

    player.addEventListener(cast.framework.events.EventType.PAUSE,
      () => {
        this.props.onPause(this);
      });

    player.addEventListener(cast.framework.events.EventType.PLAYER_LOAD_COMPLETE,
      () => {
        this.seekToTime(this.props.startTime);
        const textTracksManager = player.getTextTracksManager();

        if(this.props.subtitles) {
          // Create track 1 for English text
          const track = textTracksManager.createTrack();
          track.trackContentType = "text/vtt";
          track.trackContentId = this.props.subtitles[0];
          track.language = "en";

          // Add tracks
          textTracksManager.addTracks([track,]);
        }

        // Set the first matching language text track to be active
        textTracksManager.setActiveByLanguage("en");
      });

    player.addEventListener(cast.framework.events.EventType.ENDED,
      () => {
        this.props.onEnded(this);
      });

    var mediaInfo = new cast.framework.messages.MediaInformation();
    const source = this.props.sources ? this.props.sources[0] : null;
    this.source = source;
    mediaInfo.contentId = source;
    mediaInfo.contentType = "video/mp4";
    const request = new cast.framework.messages.LoadRequestData();
    request.media = mediaInfo;
    request.autoplay = true;

    player.load(request);
  }

  render() {
    const source = this.props.sources ? this.props.sources[0] : null;
    if (this.source && this.source !== source) {
      const context = cast.framework.CastReceiverContext.getInstance();
      const player = context.getPlayerManager();
      var mediaInfo = new cast.framework.messages.MediaInformation();
      this.source = source;
      mediaInfo.contentId = source;
      mediaInfo.contentType = "video/mp4";
      const request = new cast.framework.messages.LoadRequestData();
      request.media = mediaInfo;
      request.autoplay = true;

      player.load(request);
    }
    return null;
  }

  pause() {
    const context = cast.framework.CastReceiverContext.getInstance();
    const player = context.getPlayerManager();
    player.pause();
  }

  play() {
    const context = cast.framework.CastReceiverContext.getInstance();
    const player = context.getPlayerManager();
    player.play();
  }

  skipForward() {
    const context = cast.framework.CastReceiverContext.getInstance();
    const player = context.getPlayerManager();
    player.seek(player.getCurrentTimeSec() + 15);
  }

  skipBack(time) {
    time = time || 15;
    const context = cast.framework.CastReceiverContext.getInstance();
    const player = context.getPlayerManager();
    const seekTime = player.getCurrentTimeSec() - time;
    player.seek(seekTime >= 0 ? seekTime : 0);
  }

  seekToTime(time) {
    const context = cast.framework.CastReceiverContext.getInstance();
    const player = context.getPlayerManager();
    player.seek(time);
  }

  getCurrentTime() {
    const context = cast.framework.CastReceiverContext.getInstance();
    const player = context.getPlayerManager();
    return player.getCurrentTimeSec();
  }

  seek(percent) {
    const context = cast.framework.CastReceiverContext.getInstance();
    const player = context.getPlayerManager();
    player.seek((player.getDurationSec() * percent) / 100);
  }

}

module.exports = ChromecastPlayer;
