import React from "react";

import ShowPicker from "./pickers/ShowPicker";

import Carousel from "./generic/Carousel";
import MetadataImage from "./generic/MetadataImage";
import INavigation from "../utilities/providers/navigation/INavigation";
import KeepWatching from "../models/KeepWatchingData";
import VideoLoader from "../utilities/VideoLoader";
import ShowProgressProvider from "../utilities/providers/ShowProgressProvider";
import CacheProvider from "../utilities/providers/CacheProvider";
import FileCache from "../models/FileCache";
import CacheBasedEpisodeProvider from "../utilities/providers/CacheBasedEpisodeProvider";
import MetadataProvider from "../utilities/providers/MetadataProvider";

function lastWatchedSort(a, b) {
  return (b.lastUpdated || 0) - (a.lastUpdated || 0);
}

export interface KeepWatchingProps {
  navigation: INavigation;
  videoLoader: VideoLoader;
  showProgressProvider: ShowProgressProvider;
  cacheProvider: CacheProvider;
  navOrder?: number;
  episodeLoader: CacheBasedEpisodeProvider;
  metadataProvider: MetadataProvider;
}


export interface KeepWatchingState {
  root: string;
  videos: KeepWatching[];
  showName?: string;
  showPath?: string;
  cachePath?: FileCache;
}

export default class KeepWatchingComponent extends React.Component<KeepWatchingProps, KeepWatchingState> {
  private dragging: boolean;
  constructor(props) {
    super(props);
    this.state = { root: "", videos: [], };
    this.dragging = false;
    props.showProgressProvider.getShowsInProgress().then(videos => {
      this.setState({ videos: videos.sort(lastWatchedSort), });
    });
  }

  componentDidMount() {

  }

  async play(video) {
    if (this.dragging) {
      return;
    }
    if (video.show === "movie") {
      return this.props.videoLoader.loadVideo(video.show, video.episode.substring("Movies/".length), 0);
    }

    if (video.show === "collection") {
      return this.props.videoLoader.loadVideo(video.show, video.season, video.episode);
    }

    if (video.show === "playlist") {
      return this.props.videoLoader.loadVideo(video.show, video.season, video.episode);
    }

    const latest = await this.props.showProgressProvider.getShowProgress(video.show);

    const showPath = await this.props.cacheProvider.getShowPath(video.show);
    const cachePath = await this.props.cacheProvider.getCacheFromPath(showPath);
    //this.setState({showName, showPath, cachePath});
    const folder = `${showPath}/${latest.season}`;
    if (latest.episode.endsWith(".mp4")) {
      latest.episode = latest.episode.substring(0, latest.episode.indexOf(".mp4"));
    }
    const episode = Object.keys(cachePath.folders[latest.season].files).sort(window["tvShowSort"]).indexOf(latest.episode);
    this.props.videoLoader.loadVideo("tv", folder, episode);
  }

  isDragging(dragging) {
    this.dragging = dragging;
  }

  cancelShowChooser() {
    this.setState({ "showName": null, });
  }

  render() {
    const videos = this.state.videos.slice(0, 30).map((video) => {
      const type = video.show === "movie" ? "movies" :
        video.show === "playlist" ? "playlist" :
          video.show === "collection" ? "collections" : "tv";
      const name = video.show === "movie" ? video.episode.substring("Movies/".length) :
        video.show === "collection" ?
          video.season :
          video.show === "playlist" ?
            video.season :
            video.show;
      return <div style={{ "display": "inline-block", width: "150px", margin: "0 0 0 0", padding: "0 0 0 0", height: "225px", overflow: "hidden", textAlign: "left", verticalAlign: "top", wordWrap: "break-word", }}
        key={video.show} onClick={this.play.bind(this, video)}>
        <MetadataImage displayNameOnFail={true} style={{ display: "block", margin: "0 0 0 0", padding: "0 0 0 0", }} width={150} height={225} type={type} name={name} ></MetadataImage>
      </div>;
    });

    let videosView = <Carousel navOrder={this.props.navOrder} navigation={this.props.navigation} isDragging={this.isDragging.bind(this)} itemWidth={150} height={225}>{videos}</Carousel>;

    if (this.state.videos.length > 0) {
      videosView = <div>
        <div className="homeHeader">Keep Watching</div>
        {videosView}
      </div>;
    }

    let showPicker = null;

    if (this.state.showName) {
      showPicker = <ShowPicker
        metadataProvider={this.props.metadataProvider}
        episodeLoader={this.props.episodeLoader}
        navigation={this.props.navigation}
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


