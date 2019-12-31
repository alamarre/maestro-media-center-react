import React from "react";

import Home from "./Home";
import ISettingsManager from "../utilities/ISettingsManager";
import CollectionsManager from "../utilities/CollectionsManager";
import PlaylistManager from "../utilities/providers/playertypes/Playlist";
import CacheBasedEpisodeProvider from "../utilities/providers/CacheBasedEpisodeProvider";
import CacheProvider from "../utilities/providers/CacheProvider";
import CacheBasedSearch from "../utilities/providers/CacheBasedSearch";
import ShowProgressProvider from "../utilities/providers/ShowProgressProvider";
import MetadataProvider from "../utilities/providers/MetadataProvider";
import NewMoviesProvider from "../utilities/providers/NewMoviesProvider";
import AuthTokenManager from "../utilities/AuthTokenManager";
import AccountProvider from "../utilities/providers/AccountProvider";
import VideoLoader from "../utilities/VideoLoader";
import INavigation from "../utilities/providers/navigation/INavigation";

export interface AppProps {
  router: any,
  authTokenManager: AuthTokenManager,
  accountProvider: AccountProvider,
  videoLoader: VideoLoader,
  navigation: INavigation,
  location: any;
  settingsManager: ISettingsManager;
  collectionsManager: CollectionsManager;
  playlistManager: PlaylistManager;
  imageRoot: string;
  episodeLoader: CacheBasedEpisodeProvider;
  cacheProvider: CacheProvider;
  searcher: CacheBasedSearch;
  showProgressProvider: ShowProgressProvider;
  metadataProvider: MetadataProvider;
  newMoviesProvider: NewMoviesProvider;
  dataProviders: any;
}

export default class App extends React.Component<AppProps, {}> {

  constructor(props) {
    super(props);
    this.state = {};
  }

  componentDidMount() {
    if (!this.props.authTokenManager.isAuthenticated()) {
      if (this.props.router.location.pathname != "/login") {
        this.props.router.replace("/login");
      }
    } else if (!this.props.authTokenManager.isProfileSet() && this.props.router.location.pathname != "/profile") {
      this.props.router.replace("/profile");
    } else {
      this.props.accountProvider.getAccountId().then(accountInfo => {
        window["accountId"] = accountInfo.accountId;
        this.forceUpdate();
      });
    }

    this.props.videoLoader.setRouter(this.props.router);

    document.addEventListener("maestro-load-video", (event) => {
      event = event["detail"];
      //this.props.videoLoader.loadVideo(event["type"], event["folder"], event["index"]);
      this.props.router.push(`/view?type=${event["type"]}&index=${event["index"]}&folder=${event["folder"]}&profile=${event["profile"]}`);
    });

    document.addEventListener("maestro-offline-change", (event) => {
      event = event["detail"];
      //this.props.videoLoader.loadVideo(event["type"], event["folder"], event["index"]);
      this.setState({ hasOfflineVideos: event["offline"], });
    });
  }

  normalizePath(path) {
    if (path.indexOf("/") === 0) {
      path = path.substring(1);
    }
    return decodeURIComponent(path.toLowerCase());
  }

  componentDidUpdate(prevProps) {
    if (this.normalizePath(this.props.location.pathname) !== this.normalizePath(prevProps.location.pathname)) {
      const oneIsSub = (a: string, b: string) => {
        a = this.normalizePath(a);
        b = this.normalizePath(b);
        if (a.length < b.length) {
          const c = a;
          a = b;
          b = c;
        }
        return (a.indexOf(b) == 0);

      }
      if (!oneIsSub(this.props.location.pathname, prevProps.location.pathname)) {
        this.props.navigation.clear();
      }
      if (!window["accountId"]) {
        this.props.accountProvider.getAccountId().then(accountInfo => {
          window["accountId"] = accountInfo.accountId;
          this.forceUpdate();
        });
      }
    }
  }

  updateCollectionCount(count) {
    this.setState({ collectionCount: count, });
  }

  render() {
    const body = this.props.children || <Home {...this.props} ></Home>
    return (
      <div>{body}</div>
    );
  }
}
