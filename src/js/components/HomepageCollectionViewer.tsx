import React from "react";

import ShowPicker from "./ShowPicker";

import Carousel from "./generic/Carousel";
import MoviePicker from "./pickers/MovieDetails";
import MetadataImage from "./generic/MetadataImage";
import INavigation from "../utilities/providers/navigation/INavigation";
import HomepageCollection from "../models/HomepageCollection";
import FileCache from "../models/FileCache";
import CacheBasedEpisodeProvider from "../utilities/providers/CacheBasedEpisodeProvider";
import VideoLoader from "../utilities/VideoLoader";
import PlaylistManager from "../utilities/providers/playertypes/Playlist";
import ShowProgressProvider from "../utilities/providers/ShowProgressProvider";
import MetadataProvider from "../utilities/providers/MetadataProvider";
import HomepageCollectionManager from "../utilities/HomepageCollectionManager";

export interface HomepageCollectionViewerProps {
  navOrder?: number;
  navigation: INavigation;
  homepageCollectionManager: HomepageCollectionManager;
  episodeLoader: CacheBasedEpisodeProvider;
  videoLoader: VideoLoader;
  playlistManager: PlaylistManager;
  showProgressProvider: ShowProgressProvider;
  metadataProvider: MetadataProvider;
  updateCount: (count: number) => void;
}

export interface HomepageCollectionViewerState {
  root: string;
  collections: HomepageCollection[];
  movieName?: string;
  showName?: string;
  showPath?: string;
  cachePath?: FileCache;
}

export default class HomepageCollectionViewer extends React.Component<HomepageCollectionViewerProps, HomepageCollectionViewerState> {
  private dragging: boolean;

  constructor(props) {
    super(props);
    this.state = { root: "", collections: [], };
    this.dragging = false;
  }

  componentDidMount() {
    this.props.homepageCollectionManager.getAllCollections().then(collections => {
      collections = collections.filter(c => {
        if (!c.startDate || !c.endDate) {
          return true;
        }

        const start = new Date(c.startDate);
        const end = new Date(c.endDate);
        const current = new Date();
        if (current > start && current < end) {
          return true;
        }
        current.setFullYear(start.getFullYear());
        return current > start && current < end;
      })
      for (const collection of collections) {
        collection.items = collection.items.sort((a, b) => window["tvShowSort"](a.name, b.name));
      }
      if (this.props.updateCount) {
        this.props.updateCount(collections.length);
      }
      this.setState({ collections, });
    });
  }

  isDragging(dragging) {
    this.dragging = dragging;
  }

  play(movie) {
    if (!this.dragging) {
      this.setState({ movieName: movie.name, });
    }
  }


  cancelChooser() {
    this.setState({ "movieName": null, });
  }

  cancelShowChooser() {
    this.setState({ "showName": null, });
  }

  render() {
    if (this.state.collections.length == 0) {
      return <div></div>;
    }

    const collectionsView = this.state.collections.map((collection, index) => {
      const videos = collection.items.map(video => {
        return <div style={{ "display": "inline-block", width: "150px", margin: "0 0 0 0", padding: "0 0 0 0", height: "225px", overflow: "hidden", textAlign: "left", verticalAlign: "top", wordWrap: "break-word", }}
          key={video.name} onClick={this.play.bind(this, video)}>
          <MetadataImage displayNameOnFail={true} style={{ display: "block", margin: "0 0 0 0", padding: "0 0 0 0", }} width={150} height={225} type={video.type} name={video.name} ></MetadataImage>
        </div>
      });
      const navOrder = this.props.navOrder ? this.props.navOrder + index : null;
      return <div key={collection.name}>
        <div className="homeHeader">{collection.name}</div>
        <Carousel navOrder={navOrder} navigation={this.props.navigation} isDragging={this.isDragging.bind(this)} itemWidth={150} height={225}>{videos}</Carousel>
      </div>
    });

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
    if (this.state.showName) {
      showPicker = <ShowPicker
        navigation={this.props.navigation}
        metadataProvider={this.props.metadataProvider}
        episodeLoader={this.props.episodeLoader}
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
        {collectionsView}
        {showPicker}
      </div>
    );
  }
}


