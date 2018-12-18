import React from "react";

import ShowPicker from "./ShowPicker";

const Carousel = require("./generic/Carousel");
const MetadataImage = require("./generic/MetadataImage");

function lastWatchedSort(a, b) {
  return (b.lastUpdated || 0) - (a.lastUpdated || 0);
}

class KeepWatching extends React.Component {
  constructor(props) {
    super(props);
    this.state = { root: "", videos: [], };
    props.showProgressProvider.getShowsInProgress().then(videos => {
      this.setState({ videos: videos.sort(lastWatchedSort), });
    });
  }

  componentDidMount() {

  }

  async play(video) {
    if(video.show === "movie") {
      return this.props.videoLoader.loadVideo(video.show, video.episode.substring("Movies/".length), 0);
    }

    if(video.show === "collection") {
      return this.props.videoLoader.loadVideo(video.show, video.season, video.episode);
    }

    const showPath = await this.props.cacheProvider.getShowPath(video.show);
    const cachePath = await this.props.cacheProvider.getCacheFromPath(showPath);
    //this.setState({showName, showPath, cachePath});
    const folder = `${showPath}/${video.season}`;
    if(video.episode.endsWith(".mp4")) {
      video.episode = video.episode.substring(0, video.episode.indexOf(".mp4"));
    }
    const episode = Object.keys(cachePath.folders[video.season].files).sort(window.tvShowSort).indexOf(video.episode);
    this.props.videoLoader.loadVideo("tv", folder, episode);
  }

  cancelShowChooser() {
    this.setState({ "showName": null, });
  }

  render() {
    const videos = this.state.videos.slice(0, 30).map((video) => {
      //const imageSource = `${this.props.imageRoot}/150x225/tv/show/${video.show}.jpg`
      /*const imageSource = video.show === "movie" ?
        `${this.props.imageRoot}/150x225/movies/${video.episode.substring("Movies/".length)}.jpg` :
        video.show === "collection" ?
          `${this.props.imageRoot}/150x225/collections/${video.season}.jpg` :
          `${this.props.imageRoot}/150x225/tv/show/${video.show}.jpg`;*/
      const type = video.show === "movie" ? "movies" :
        video.show === "collection" ? "collections": "tv";
      const name = video.show === "movie" ? video.episode.substring("Movies/".length) :
        video.show === "collection" ?
          video.season:
          video.show;    
      return <div style={{ "display": "inline-block", width: "200px", height: "350px", overflow: "hidden", textAlign:"left", verticalAlign: "top", wordWrap: "break-word", margin: "10px 10px", }}
        key={video.show} onClick={this.play.bind(this, video)}>
        <MetadataImage style={{display: "block",}} width={150} height={225} type={type} name={name} ></MetadataImage>
        {name}
      </div>;
    });

    let videosView = <Carousel itemWidth={210}>{videos}</Carousel>;

    if (this.state.videos.length > 0) {
      videosView = <div>
        <div>Keep Watching</div>
        {videosView}
      </div>;
    }

    let showPicker = null;

    if (this.state.showName) {
      showPicker = <ShowPicker
        router={this.props.router}
        videoLoader={this.props.videoLoader}
        showProgressProvider={this.props.showProgressProvider}
        showName={this.state.showName}
        showPath={this.state.showPath}
        cancelFunction={this.cancelShowChooser.bind(this)}
        showCache={this.state.cachePath}>
      </ShowPicker>;
    }
    return (
      <div>
        {videosView}
        {showPicker}
      </div>
    );
  }
}

module.exports = KeepWatching;
