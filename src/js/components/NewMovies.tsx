import React from "react";

import Carousel from "./generic/Carousel";
import MoviePicker from "./pickers/MovieDetails";
import MetadataImage from "./generic/MetadataImage";
import NewMoviesProvider from "../utilities/providers/NewMoviesProvider";
import INavigation from "../utilities/providers/navigation/INavigation";
import { Router, } from "react-router";
import VideoLoader from "../utilities/VideoLoader";
import PlaylistManager from "../utilities/providers/playertypes/Playlist";
import ShowProgressProvider from "../utilities/providers/ShowProgressProvider";
import MetadataProvider from "../utilities/providers/MetadataProvider";
import CacheBasedEpisodeProvider from "../utilities/providers/CacheBasedEpisodeProvider";

export interface NewMoviesProps {
  newMoviesProvider: NewMoviesProvider;
  navigation: INavigation;
  navOrder?: number;
  router: Router;
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
    const videos = this.state.videos.slice(0, 30).map((video) => {

      const name = video;
      return <div style={{ "display": "inline-block", width: "150px", margin: "0 0 0 0", padding: "0 0 0 0", height: "350px", overflow: "hidden", textAlign: "left", verticalAlign: "top", wordWrap: "break-word", }}
        key={video} onClick={this.play.bind(this, video)}>
        <MetadataImage style={{ display: "block", margin: "0 0 0 0", padding: "0 0 0 0", }} width={150} height={225} type="movies" name={video}></MetadataImage>
        {name}
      </div>;
    });

    let videosView = <Carousel navOrder={this.props.navOrder} navigation={this.props.navigation} isDragging={this.isDragging.bind(this)} itemWidth={150} height={350}>{videos}</Carousel>;

    if (this.state.videos.length > 0) {
      videosView = <div>
        <div>New Movies</div>
        {videosView}
      </div>;
    }

    let showPicker = null;

    if (this.state.movieName) {
      showPicker = <MoviePicker
        navigation={this.props.navigation}
        router={this.props.router}
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


