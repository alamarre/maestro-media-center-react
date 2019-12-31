import React from "react";
import { Link, Router, } from "react-router";

import SearchResults from "./SearchResults";
import KeepWatching from "./KeepWatching";

import NewMovies from "./NewMovies";
import NewShows from "./NewShows";
import HomePageCollectionViewer from "./HomePageCollectionViewer";
import ClickableButton from "./generic/ClickableButton";
import INavigation from "../utilities/providers/navigation/INavigation";
import ISettingsManager from "../utilities/ISettingsManager";
import CacheBasedEpisodeProvider from "../utilities/providers/CacheBasedEpisodeProvider";
import CollectionsManager from "../utilities/CollectionsManager";
import PlaylistManager from "../utilities/providers/playertypes/Playlist";
import VideoLoader from "../utilities/VideoLoader";
import CacheBasedSearch from "../utilities/providers/CacheBasedSearch";
import CacheProvider from "../utilities/providers/CacheProvider";
import MetadataProvider from "../utilities/providers/MetadataProvider";
import ShowProgressProvider from "../utilities/providers/ShowProgressProvider";
import NewMoviesProvider from "../utilities/providers/NewMoviesProvider";

export interface HomeProps {
  navigation: INavigation;
  settingsManager: ISettingsManager;
  episodeLoader: CacheBasedEpisodeProvider;
  collectionsManager: CollectionsManager;
  playlistManager: PlaylistManager;
  imageRoot: string;
  router: Router;
  videoLoader: VideoLoader;
  searcher: CacheBasedSearch;
  cacheProvider: CacheProvider;
  metadataProvider: MetadataProvider;
  showProgressProvider: ShowProgressProvider;
  dataProviders: any;
  newMoviesProvider: NewMoviesProvider;
}

export interface HomeState {
  collectionCount: number;
}

export default class Home extends React.Component<HomeProps, HomeState> {

  constructor(props) {
    super(props);
    this.state = { collectionCount: 0, };
  }

  updateCollectionCount(count) {
    this.setState({ collectionCount: count, });
  }

  render() {
    const settingsLink = <ClickableButton navigation={this.props.navigation} navOrder={this.state.collectionCount + 5} to="settings">Settings</ClickableButton>;

    const remoteLink = (this.props.settingsManager.get("playToRemoteClient") && this.props.settingsManager.get("playToRemoteClient") != "") ?
      <Link ref="remote" className="nostyle" to="remote">Remote Control</Link>
      : null;
    var body = <div>
      <div>
        <SearchResults
          navOrder={0}
          navigation={this.props.navigation}
          episodeLoader={this.props.episodeLoader}
          collectionsManager={this.props.collectionsManager}
          playlistManager={this.props.playlistManager}
          router={this.props.router}
          videoLoader={this.props.videoLoader}
          searcher={this.props.searcher}
          cacheProvider={this.props.cacheProvider}
          metadataProvider={this.props.metadataProvider}
          showProgressProvider={this.props.showProgressProvider} />
      </div>
      <div>
        <KeepWatching
          navOrder={1}
          navigation={this.props.navigation}
          episodeLoader={this.props.episodeLoader}
          metadataProvider={this.props.metadataProvider}
          router={this.props.router}
          videoLoader={this.props.videoLoader}
          cacheProvider={this.props.cacheProvider}
          showProgressProvider={this.props.showProgressProvider} />
      </div>
      <div>
        <NewMovies navOrder={2} {...this.props} ></NewMovies>
      </div>
      <div>
        <HomePageCollectionViewer updateCount={(count) => this.updateCollectionCount(count)} navOrder={3} {...this.props} ></HomePageCollectionViewer>
      </div>
      <div>
        <NewShows navOrder={this.state.collectionCount + 3} {...this.props} showProvider={this.props.dataProviders.recentTvShows} ></NewShows>
      </div>

      <ClickableButton navigation={this.props.navigation} navOrder={this.state.collectionCount + 4} to="videos">Browse the collection</ClickableButton>
      <div>{remoteLink}</div>
      {settingsLink}
    </div>;
    return (
      <div>{body}</div>
    );
  }
}
