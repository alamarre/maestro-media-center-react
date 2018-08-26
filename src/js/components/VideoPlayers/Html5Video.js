import React from 'react'

class Html5VideoPlayer extends React.Component {
  constructor(props) {
    super(props);
    if (this.props.remoteController) {
      this.props.remoteController.mapPartialUpdateFunctions({
        play: this.play.bind(this),
        pause: this.pause.bind(this),
        skipForward: this.skipForward.bind(this),
        skipBack: this.skipBack.bind(this),
        seek: this.seek.bind(this)
      })
    }
  }

  componentDidMount() {

  }

  pause() {
    this.refs.video.pause();
  }

  play() {
    this.refs.video.play();
  }

  skipForward() {
    this.refs.video.currentTime += 15;
  }

  skipBack(time) {
    time = time || 15;
    this.refs.video.currentTime -= time;
  }

  seekToTime(time) {
    this.refs.video.currentTime = time;
  }

  getCurrentTime() {
    return this.refs.video && this.refs.video.currentTime;
  }

  seek(percent) {
    this.refs.video.currentTime = (this.refs.video.duration * percent) / 100;
  }

  render() {
    const subtitles = this.props.source && this.props.source.replace('.mp4', '.vtt');

    return <video key={this.props.source} crossOrigin="anonymous" onLoadedMetadata={() => { this.seekToTime(this.props.startTime) }} onEnded={() => this.props.onEnded(this)} onPlay={() => this.props.onPlay(this)} onPause={() => this.props.onPause(this)} style={{ margin: 0, padding: 0, left: 0, top: 0, width: "100%", height: "100%", position: "absolute", background: "#000", display: this.props.source != null ? 'block' : 'none' }} ref='video' data-source={this.props.source} controls={true} autoPlay={true}>
      <source src={this.props.source} type="video/mp4" />
      <track src={subtitles} kind="subtitles" srcLang="en" label="English" default />
    </video>
  }

}

module.exports = Html5VideoPlayer;
