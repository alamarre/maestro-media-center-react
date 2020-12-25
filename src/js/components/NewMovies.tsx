import React from "react";

import Carousel from "./generic/Carousel";
import MoviePicker from "./pickers/MovieDetails";
import MetadataImage from "./generic/MetadataImage";
import NewMoviesProvider from "../utilities/providers/NewMoviesProvider";
import INavigation from "../utilities/providers/navigation/INavigation";
import VideoLoader from "../utilities/VideoLoader";
import PlaylistManager from "../utilities/providers/playertypes/Playlist";
import ShowProgressProvider from "../utilities/providers/ShowProgressProvider";
import MetadataProvider from "../utilities/providers/MetadataProvider";
import CacheBasedEpisodeProvider from "../utilities/providers/CacheBasedEpisodeProvider";
import {mainImageScale} from "../AppScale";

export interface NewMoviesProps {
  newMoviesProvider: NewMoviesProvider;
  navigation: INavigation;
  navOrder?: number;
  videoLoader: VideoLoader;
  playlistManager: PlaylistManager;
  showProgressProvider: ShowProgressProvider;
  metadataProvider: MetadataProvider;
  episodeLoader: CacheBasedEpisodeProvider;
}

export interface NewMoviesState {
  videos: string[];
  movieName?: string;

}

export default class NewMovies extends React.Component<NewMoviesProps, NewMoviesState> {
  private dragging: boolean;
  constructor(props) {
    super(props);
    this.state = { videos: [], };
    this.dragging = false;
    this.loadMovies();
  }

  async loadMovies() {
    const videos = (await this.props.newMoviesProvider.getNewMovies())
      .sort((a, b) => b.time - a.time)
      .map(v => v.movie);
    this.setState({ videos, });
  }

  isDragging(dragging) {
    this.dragging = dragging;
  }

  play(movieName) {
    if (!this.dragging) {
      this.setState({ movieName, });
    }
  }

  cancelChooser() {
    this.setState({ "movieName": null, });
  }

  render() {
    if (this.state.videos.length === 0) {
      return <div></div>;
    }

    const height = mainImageScale.height;
    const width = mainImageScale.width;
    const adjustedWidth = mainImageScale.scaledWidth;
    const adjustedHeight = mainImageScale.scaledHeight;

    const videos = this.state.videos.slice(0, 30).map((video) => {

      const name = video;
      return <div style={{ "display": "inline-block", width: `${adjustedWidth}px`, margin: "0 0 0 0", padding: "0 0 0 0", height: `${adjustedHeight}px`, overflow: "hidden", textAlign: "left", verticalAlign: "top", wordWrap: "break-word", }}
        key={video} onClick={this.play.bind(this, video)}>
        <MetadataImage displayNameOnFail={true} style={{ display: "block", margin: "0 0 0 0", padding: "0 0 0 0", }} width={width} height={height} type="movies" name={video}></MetadataImage>
      </div>;
    });

    let videosView = <Carousel navOrder={this.props.navOrder} navigation={this.props.navigation} isDragging={this.isDragging.bind(this)} itemWidth={adjustedWidth} height={adjustedHeight}>{videos}</Carousel>;

    if (this.state.videos.length > 0) {
      videosView = <div>
        <div className="homeHeader">New Movies</div>
        {videosView}
      </div>;
    }

    let showPicker = null;

    if (this.state.movieName) {
      showPicker = <MoviePicker
        navigation={this.props.navigation}
        episodeLoader={this.props.episodeLoader}
        videoLoader={this.props.videoLoader}
        showProgressProvider={this.props.showProgressProvider}
        metadataProvider={this.props.metadataProvider}
        movieName={this.state.movieName}
        cancelFunction={this.cancelChooser.bind(this)}>
      </MoviePicker>;
    }
    return (
      <div>
        {videosView}
        {showPicker}
      </div>
    );
  }
}


