import React from "react";

import Html5VideoPlayer from "./VideoPlayers/Html5Video";
import ReloadVideoDialog from "./ReloadVideoDialog";
import Menu from "./generic/Menu";

import TvShowSeriesPlayer from "../utilities/providers/playertypes/TvShow";
import MoviePlayer from "../utilities/providers/playertypes/Movie";
import MovieCollection from "../utilities/providers/playertypes/MovieCollection";
import Playlist from "../utilities/providers/playertypes/Playlist";
import INavigation from "../utilities/providers/navigation/INavigation";
import WebSocketRemoteController from "../utilities/WebSocketRemoteController";
import IPlayerManager from "../utilities/providers/playertypes/IPlayerManager";
import ShowProgressProvider from "../utilities/providers/ShowProgressProvider";
import PlaylistManager from "../utilities/providers/playertypes/Playlist";
import CollectionsManager from "../utilities/CollectionsManager";
import VideoLoader from "../utilities/VideoLoader";
import QueryStringReader from "../utilities/QueryStringReader";
import { RouteComponentProps, } from "react-router-dom";
import IEpisodeProvider from "../utilities/providers/IEpisodeProvider";
import ISettingsManager from "../utilities/ISettingsManager";

export interface VideoPlayerProps extends RouteComponentProps {
  navigation: INavigation;
  episodeLoader: IEpisodeProvider;
  remoteController: WebSocketRemoteController;
  queryStringReader: QueryStringReader;
  showProgressProvider: ShowProgressProvider;
  playlistManager: PlaylistManager;
  collectionsManager: CollectionsManager;
  videoLoader: VideoLoader;
  settings: ISettingsManager;
}

export interface VideoPlayerState {
  refs: string[];
  overlayVisibility: boolean;
  showMenu: boolean;
  seekTime: number;
  promptReload: boolean;
  sources?: string[],
  subtitles?: string[];
  name?: string;
  showEpisodeInfo: boolean;
  playWithVlc: boolean;
}

export default class VideoPlayer extends React.Component<VideoPlayerProps, VideoPlayerState> {
  private type: string;
  private profile: string;
  private preventIdleTimer: any;
  private progressTimer: any;
  private playerTypeHandlers: { [key: string]: IPlayerManager };
  private query: { [key: string]: string };
  private player;
  private eventListener;

  constructor(props) {
    super(props);
    this.query = this.props.queryStringReader.parseParameters(this.props.location.search);
    this.type = this.query["type"];
    this.profile = this.query["profile"];
    this.preventIdleTimer = null;

    this.state = { refs: [], "overlayVisibility": false, playWithVlc: this.props.settings.get("playWithVlc") != "", showEpisodeInfo: false, showMenu: false, seekTime: -1, promptReload: false, };
    this.progressTimer = null;
    if (this.props.remoteController) {
      this.props.remoteController.mapUpdateFunctions({
        setSource: this.setSourcePath.bind(this),
        next: () => { this.goToNext(); },
        previous: () => { this.goToPrevious(); },
        toggleVisibility: this.toggleVisibility.bind(this),
      });
    }

    this.eventListener = (event) => {
      const { progress, duration } = event.detail;
      if (progress == 0 && duration == 0) {
        this.goToNext();
      } else {
        // figure this one out
      }
    };

    document.addEventListener("stopped-playing", this.eventListener);

    this.playerTypeHandlers = {
      tv: new TvShowSeriesPlayer(this.props.episodeLoader, this.props.showProgressProvider),
      movie: new MoviePlayer(this.props.episodeLoader, this.props.showProgressProvider),
      collection: new MovieCollection("Movie Collections", this.props.collectionsManager, this.props.episodeLoader, this.props.showProgressProvider),
      playlist: new Playlist("Playlist", this.props.playlistManager, this.props.episodeLoader, this.props.showProgressProvider),
    };
  }

  componentWillUnmount() {
    this.props.navigation.unfocusDialog(this);
    if (this.preventIdleTimer) {
      clearInterval(this.preventIdleTimer);
    }
  }

  componentDidUpdate(previousProps, previousState: VideoPlayerState) {
    if (this.state.playWithVlc && previousState.sources != this.state.sources && window["MaestroNative"]) {
      window["MaestroNative"]["showVideo"](JSON.stringify({
        title: this.state.name,
        sources: this.state.sources.map(s => new URL(s).href),
        subtitleSources: (this.state.subtitles || []).map(s => new URL(s).href),
        startTime: Math.floor(this.state.seekTime)
      }));
    }
  }

  openMenu() {
    this.setState({ "showMenu": true, }, () => {
      //this.props.navigation.focusDialog(this.refs.menu);
    })
  }

  closeMenu() {
    this.setState({ "showMenu": false, }, () => {
      this.props.navigation.focusDialog(this);
    })
  }

  selectCurrent() {
    this.player?.pause();
  }

  componentDidMount() {
    this.props.navigation.focusDialog(this);
    if (this.query["folder"]) {
      var path = this.query["folder"];
      var parentPath = path.substring(0, path.lastIndexOf("/"));
      var subdirectory = path.substring(path.lastIndexOf("/") + 1);

      this.setSourcePath(parentPath, subdirectory, this.query["index"]);
    }

    document.addEventListener("maestro-load-video", (event: any) => {
      event = event.detail;
      var path = event.folder;
      var parentPath = path.substring(0, path.lastIndexOf("/"));
      var subdirectory = path.substring(path.lastIndexOf("/") + 1);
      this.type = event.type;
      this.profile = event.profile;
      this.setSourcePath(parentPath, subdirectory, event.index);
    });
  }

  render() {

    if (this.state.promptReload) {
      const reload = async () => {
        const { sources, subtitles, name, seekTime, path, index, } = await this.playerTypeHandlers[this.type].reload();
        const orderedSources = [].concat(sources);
        for (const source of sources) {
          const newSource = await this.props.episodeLoader.getAvailableLocalSource(source);
          if (newSource) {
            orderedSources.unshift(newSource);
          }
        }
        this.setState({ sources: orderedSources, subtitles, name, seekTime, promptReload: false });
        this.props.videoLoader.setUrl(this.type, path, index, false, this.profile);
        this.props.navigation.focusDialog(this);
      };
      const goHome = () => {
        this.props.history.replace("/");
      };
      return <ReloadVideoDialog navigation={this.props.navigation} reload={reload} goHome={goHome}></ReloadVideoDialog>
    }
    var currentEpisodeStyle: React.CSSProperties = {
      position: "absolute",
      left: "100px",
      right: "100px",
      bottom: "20px",
      fontSize: "36px",
      color: "white",
      backgroundColor: "black",
      zIndex: 100,
      transition: "opacity 0.5s",
      opacity: 0,
    };

    const overlayStyle: React.CSSProperties = {
      position: "absolute",
      left: "0px",
      right: "0px",
      top: "0px",
      backgroundColor: "black",
      width: "100%",
      height: "100%",
      zIndex: 10000,
    };

    let overlay = null;
    if (this.state.overlayVisibility) {
      overlay = <div style={overlayStyle}></div>;
    }

    if (this.state.showEpisodeInfo) {
      currentEpisodeStyle["opacity"] = 1;
    }
    let videoSource = null;
    if (this.state.seekTime > -1 && !this.state.playWithVlc) {
      videoSource = <Html5VideoPlayer key="videoplayer" remoteController={this.props.remoteController} startTime={this.state.seekTime} sources={this.state.sources} subtitles={this.state.subtitles} onEnded={this.goToNext.bind(this)}
        onPlay={this.onPlay.bind(this)} onPause={this.onPause.bind(this)}
      />;

    }
    let menu = null;
    if (this.state.showMenu) {
      const items = [
        { name: "Play", action: () => { this.player?.play(); this.closeMenu(); }, },
        { name: "Skip Forward", action: () => { this.player?.skipForward(); }, },
        { name: "Skip Back", action: () => { this.player?.skipBack(); }, },
        { name: `Play Faster (${Math.floor((this.player?.getPlaybackSpeed() + 0.1) * 100) / 100})`, action: () => { this.player?.speedUp(); this.forceUpdate(); }, },
        {
          name: `Play Slower(${Math.floor((this.player?.getPlaybackSpeed() - 0.1) * 100) / 100})`, action: () => { this.player?.slowDown(); this.forceUpdate(); },
        },
        { name: "Download", action: () => { this.download(); this.closeMenu(); }, },
        { name: "Go Home", action: () => this.props.history.replace("/"), },
        { name: "Toggle Screen Visibility", action: () => { this.toggleVisibility(); this.player?.play(); this.closeMenu(); }, },
        { name: "Previous episode", action: () => { this.goToPrevious(); this.closeMenu(); }, },
        { name: "Next episode", action: () => { this.goToNext(); this.closeMenu(); }, }
      ];
      menu = <Menu navigation={this.props.navigation} ref={menu} items={items}></Menu>
    }
    return (
      <div>
        {menu}
        {videoSource}
        <div style={currentEpisodeStyle} ref="episodeInfo">{this.state.name}</div>
        {overlay}
      </div>
    );
  }

  download() {
    if (this.state?.sources[0]) {
      const url = new URL(this.state.sources[0]).href + "?download=true";
      window.open(url, "_blank");
    }
  }

  toggleVisibility() {
    this.setState({ "overlayVisibility": !this.state.overlayVisibility, });
  }

  async setSourcePath(parentPath, subdirectory, index) {
    if (typeof index !== "number") {
      index = parseInt(index);
    }

    if (parentPath === "/" || parentPath === "") {
      parentPath = subdirectory;
      subdirectory = "";
    }
    const { sources, subtitles, name, seekTime, path, } = await this.playerTypeHandlers[this.type].load(parentPath, subdirectory, index);
    /*if (this.props.offlineStorage) {
      const data = await this.props.offlineStorage.getVideo(sources[0]);
      if (data) {
        sources[0] = data;
      }
    }*/

    const orderedSources = [].concat(sources);
    for (const source of sources) {
      const newSource = await this.props.episodeLoader.getAvailableLocalSource(source);
      if (newSource) {
        orderedSources.unshift(newSource);
      }
    }
    this.setState({ sources: orderedSources, subtitles, name, seekTime, });
    this.props.videoLoader.setUrl(this.type, path, index, false, this.profile);
  }

  onPause() {
    this.showEpisodeInfo();
    this.openMenu();
  }

  onPlay(player) {
    this.player = player;
    if (!this.progressTimer) {
      this.progressTimer = setInterval(() => {
        const time = (this.player || player).getCurrentTime();
        if (time) {
          this.playerTypeHandlers[this.type].recordProgress(time);
        }
      }, 30 * 1000);
    }
    this.hideEpisodeInfo();
    this.closeMenu();
  }

  showEpisodeInfo() {
    this.setState({ "showEpisodeInfo": true, });
  }

  hideEpisodeInfo() {
    this.setState({ "showEpisodeInfo": false, });
  }

  async goToNext() {
    const { sources, subtitles, name, seekTime, path, index, } = await this.playerTypeHandlers[this.type].goToNext();
    if (sources == null && this.props.navigation) {
      this.setState({ promptReload: true, });
    } else {
      const orderedSources = [].concat(sources);
      for (const source of sources) {
        const newSource = await this.props.episodeLoader.getAvailableLocalSource(source);
        if (newSource) {
          orderedSources.unshift(newSource);
        }
      }
      this.setState({ sources: orderedSources, subtitles, name, seekTime, });
      this.props.videoLoader.setUrl(this.type, path, index, false, this.profile);
    }
  }

  async goToPrevious() {
    const { sources, subtitles, name, seekTime, path, index, } = await this.playerTypeHandlers[this.type].goToPrevious();
    const orderedSources = [].concat(sources);
    for (const source of sources) {
      const newSource = await this.props.episodeLoader.getAvailableLocalSource(source);
      if (newSource) {
        orderedSources.unshift(newSource);
      }
    }
    this.setState({ sources: orderedSources, subtitles, name, seekTime, });
    this.props.videoLoader.setUrl(this.type, path, index, false, this.profile);
  }
}


