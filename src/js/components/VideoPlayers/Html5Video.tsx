import React from "react";
import ReactDOM from "react-dom";
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

  getVideoElement() {
    const video: HTMLVideoElement = ReactDOM.findDOMNode(this.refs.video);
    return video;
  }

  componentDidMount() {

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

  seek(percent) {
    this.getVideoElement().currentTime = (this.getVideoElement().duration * percent) / 100;
  }

  componentDidUpdate(prevProps) {
    if (prevProps.sources[0] !== this.props.sources[0]) {
      this.getVideoElement().load();
    }
  }

  render() {
    const subtitles = this.props.subtitles ?
      <track src={this.props.subtitles[0]} kind="subtitles" srcLang="en" label="English" default></track> : null;
    const sources = this.props.sources.map(s => {
      return <source src={s} key={s} type="video/mp4"></source>;
    });

    return <video key={"video"} crossOrigin="anonymous"
      onClick={() => this.playPause()}
      onLoadedMetadata={() => { this.seekToTime(this.props.startTime); }}
      onEnded={() => this.props.onEnded(this)}
      onPlay={() => this.props.onPlay(this)}
      onPause={() => this.props.onPause(this)}
      style={{
        margin: 0, padding: 0, left: 0, top: 0, width: "100%", height: "100%", position: "absolute",
        background: "#000", display: this.props.sources != null ? "block" : "none", outline: "none",
      }}
      ref='video' data-source={this.props.sources[0]} controls={true} autoPlay={true}>
      {sources}
      {subtitles}
    </video>;
  }

}


