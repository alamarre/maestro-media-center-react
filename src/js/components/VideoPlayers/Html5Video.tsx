import React from "react";
import WebSocketRemoteController from "../../utilities/WebSocketRemoteController";

export interface Html5VideoPlayerProps {
  remoteController: WebSocketRemoteController;
  sources: string[];
  subtitles?: string[];
  startTime: number;
  onEnded: (player: Html5VideoPlayer) => void;
  onPlay: (player: Html5VideoPlayer) => void;
  onPause: (player: Html5VideoPlayer) => void;
}

export interface Html5VideoPlayerState {

}

export default class Html5VideoPlayer extends React.Component<Html5VideoPlayerProps, Html5VideoPlayerState> {
  private video = React.createRef<HTMLVideoElement>();
  private started: boolean;

  constructor(props, ) {
    super(props);
    this.started = false;
    if (this.props.remoteController) {
      this.props.remoteController.mapPartialUpdateFunctions({
        play: this.play.bind(this),
        pause: this.pause.bind(this),
        skipForward: this.skipForward.bind(this),
        skipBack: this.skipBack.bind(this),
        seek: this.seek.bind(this),
      });
    }

    this.handleFocus = this.handleFocus.bind(this);
    this.handleFocusLost = this.handleFocusLost.bind(this);
  }

  getVideoElement() {
    return this.video.current;
  }

  componentDidMount() {
    window.addEventListener("pause", this.handleFocusLost);
    window.addEventListener("resume", this.handleFocus);
  }

  componentWillUnmount() {
    window.removeEventListener("pause", this.handleFocusLost);
    window.removeEventListener("resume", this.handleFocus);
  }

  handleFocusLost() {
    this.getVideoElement()?.pause();
  }

  handleFocus() {
    this.getVideoElement()?.play();
  }



  pause() {
    this.getVideoElement().pause();
  }

  play() {
    this.getVideoElement().play();
  }

  playPause() {
    if (this.getVideoElement().paused) {
      this.play();
    } else {
      this.pause();
    }
  }

  skipForward() {
    this.getVideoElement().currentTime += 15;
  }

  skipBack(time) {
    time = time || 15;
    this.getVideoElement().currentTime -= time;
  }

  seekToTime(time) {
    this.getVideoElement().focus();
    this.getVideoElement().currentTime = time;
  }

  getCurrentTime() {
    return this.getVideoElement() && this.getVideoElement().currentTime;
  }

  seek(percent, ) {
    this.getVideoElement().currentTime = (this.getVideoElement().duration * percent) / 100;
  }

  componentDidUpdate(prevProps) {
    if (prevProps.sources[0] !== this.props.sources[0]) {
      this.started = false;
      this.getVideoElement().load();
    }
  }

  playStarted() {
    if (!this.started) {
      this.started = true;
      if (this.getVideoElement().currentTime < this.props.startTime) {
        this.seekToTime(this.props.startTime);
      }

    }
    this.props.onPlay(this);
  }

  onPause() {
    const video = this.getVideoElement();
    if (video.error && video.duration - video.currentTime < 2) {
      return this.props.onEnded(this);
    }
    this.props.onPause(this);
  }

  render() {
    const subtitles = this.props.subtitles ?
      <track src={this.props.subtitles[0]} kind="subtitles" srcLang="en" label="English" default></track> : null;
    const sources = this.props.sources.map((s: any, ) => {
      return <source src={s} key={s} type="video/mp4"></source>;
    });

    return <video key={"video"} crossOrigin="anonymous"
      onClick={() => this.playPause()}
      onLoadedMetadata={() => { this.seekToTime(this.props.startTime); }}
      onEnded={() => this.props.onEnded(this)}
      onPlay={() => this.playStarted()}
      onPause={() => this.onPause()}
      style={{
        margin: 0, padding: 0, left: 0, top: 0, width: "100%", height: "100%", position: "absolute",
        background: "#000", display: this.props.sources != null ? "block" : "none", outline: "none",
      }}
      ref={this.video} data-source={this.props.sources[0]} controls={true} autoPlay={true}>
      {sources}
      {subtitles}
    </video>;
  }

}


