import React from "react";
import ShowPicker from "./ShowPicker";
import CollectionPicker from "./pickers/CollectionStartPicker";
import PlaylistPicker from "./pickers/PlaylistPicker";
import MoviePicker from "./pickers/MovieDetails";
import MetadataImage from "./generic/MetadataImage";
import INavigation from "../utilities/providers/navigation/INavigation";
import { Router, } from "react-router";
import SearchResult from "../models/SearchResult";
import CacheBasedSearch from "../utilities/providers/CacheBasedSearch";
import CacheBasedEpisodeProvider from "../utilities/providers/CacheBasedEpisodeProvider";
import ShowProgressProvider from "../utilities/providers/ShowProgressProvider";
import VideoLoader from "../utilities/VideoLoader";
import MetadataProvider from "../utilities/providers/MetadataProvider";
import CollectionsManager from "../utilities/CollectionsManager";
import CacheProvider from "../utilities/providers/CacheProvider";
import FileCache from "../models/FileCache";
import ReactDOM from "react-dom";
import PlaylistManager from "../utilities/providers/playertypes/Playlist";

export interface SearchResultsProps {
  navOrder?: number;
  navigation: INavigation;
  router: Router;
  searcher: CacheBasedSearch;
  episodeLoader: CacheBasedEpisodeProvider;
  showProgressProvider: ShowProgressProvider;
  videoLoader: VideoLoader;
  metadataProvider: MetadataProvider;
  cacheProvider: CacheProvider;
  collectionsManager: CollectionsManager;
  playlistManager: PlaylistManager;
}

export interface SearchResultsState {
  refs: string[];
  searchResults: SearchResult[];
  showName?: string;
  showPath?: string;
  cachePath?: FileCache;
  movieName?: string;
  collectionName?: string;
  playlistName?: string;
}

export default class SearchResults extends React.Component<SearchResultsProps, SearchResultsState> {
  private currentResult: number;
  constructor(props) {
    super(props);
    this.state = { "searchResults": [], refs: [], };
    this.currentResult = 0;
  }

  search(value) {
    this.currentResult = 0;
    if (!value || value == "") {
      this.props.navigation.unfocusDialog(this);
      return this.setState({ "searchResults": [], });
    }
    this.props.searcher.getResults(value).then(results => {
      this.setState({ "searchResults": results, });
      this.props.navigation.focusDialog(this);
    });
  }

  focusNext() {
    this.currentResult++;
    if (this.currentResult > this.state.searchResults.length) {
      this.currentResult = 0;

    }
    if (this.currentResult == 0) {
      ReactDOM.findDOMNode<HTMLInputElement>(this.refs["searchbox"]).focus();
    }
    else {
      ReactDOM.findDOMNode<HTMLButtonElement>(this.refs[`searchresult-${this.currentResult - 1}`]).focus();
    }
  }

  focusPrevious() {
    this.currentResult--;
    if (this.currentResult < 0) {
      this.currentResult = this.state.searchResults.length;
    }
    if (this.currentResult == 0) {
      ReactDOM.findDOMNode<HTMLInputElement>(this.refs["searchbox"]).focus();
    } else {
      ReactDOM.findDOMNode<HTMLButtonElement>(this.refs[`searchresult-${this.currentResult - 1}`]).focus();
    }
  }

  selectCurrent() {
    if (this.currentResult > 0) {
      ReactDOM.findDOMNode<HTMLButtonElement>(this.refs[`searchresult-${this.currentResult - 1}`]).click();
    }
  }

  selectSource(item) {
    if (item.type == "playlist") {
      this.setState({ playlistName: item.name, });
      return;
    }
    Promise.all([this.props.cacheProvider.isTvShow(item.path), this.props.cacheProvider.getCacheFromPath(item.path),])
      .then(values => {
        const isTvShow = values[0];
        const cachePath = values[1];
        if (isTvShow) {
          this.setState({ showName: item.name, showPath: item.path, cachePath: cachePath, });
        } else if (item.type === "collection") {
          //this.props.videoLoader.loadVideo("collection", item.name, 0);
          this.setState({ collectionName: item.name, });
        } else {
          this.setState({ movieName: item.name, });
          // this.props.videoLoader.loadVideo(item.type, item.name, 0);
        }
      });
  }

  cancelShowChooser() {
    ReactDOM.findDOMNode<HTMLInputElement>(this.refs["searchbox"]).value = "";
    this.search("");
    this.setState({ "showName": null, "collectionName": null, "playlistName": null, movieName: null, });
  }

  componentDidMount() {
    this.props.navigation.registerElement(this.refs.searchbox, this.props.navOrder);
  }

  componentDidUpdate() {
    if (this.props.navOrder > -1) {
      this.props.navigation.registerElement(this.refs.searchbox, this.props.navOrder);
    }
  }

  render() {
    const searchResults = this.state.searchResults.map((item, index) => {
      const ref = `searchresult-${index}`;
      return <div style={{ backgroundColor: "black", }}><button style={{ width: "100%", textAlign: "left", }} ref={ref} className="maestroButton" key={item.path} onClick={() => this.selectSource(item)}>
        <MetadataImage style={{ display: "inline-block", }} type={item.type} name={item.name} width={50} height={75}></MetadataImage>
        {item.name}
      </button></div>;
    });

    const searchResultSection = <div style={{ position: "absolute", zIndex: 1000, }} className="list-group">{searchResults}</div>;
    let showPicker = null;
    if (this.state.showName) {
      showPicker = <ShowPicker
        navigation={this.props.navigation}
        router={this.props.router}
        episodeLoader={this.props.episodeLoader}
        videoLoader={this.props.videoLoader}
        showProgressProvider={this.props.showProgressProvider}
        showPath={this.state.showPath}
        showName={this.state.showName}
        metadataProvider={this.props.metadataProvider}
        cancelFunction={this.cancelShowChooser.bind(this)}
        showCache={this.state.cachePath}>
      </ShowPicker>;
    } else if (this.state.collectionName) {
      showPicker = <CollectionPicker
        navigation={this.props.navigation}
        metadataProvider={this.props.metadataProvider}
        router={this.props.router}
        episodeLoader={this.props.episodeLoader}
        videoLoader={this.props.videoLoader}
        collectionsManager={this.props.collectionsManager}
        showProgressProvider={this.props.showProgressProvider}
        collectionName={this.state.collectionName}
        cancelFunction={this.cancelShowChooser.bind(this)}>
      </CollectionPicker>;
    } else if (this.state.playlistName) {
      showPicker = <PlaylistPicker
        navigation={this.props.navigation}
        metadataProvider={this.props.metadataProvider}
        router={this.props.router}
        episodeLoader={this.props.episodeLoader}
        videoLoader={this.props.videoLoader}
        playlistManager={this.props.playlistManager}
        showProgressProvider={this.props.showProgressProvider}
        playlistName={this.state.playlistName}
        cancelFunction={this.cancelShowChooser.bind(this)}>
      </PlaylistPicker>;
    } else if (this.state.movieName) {
      showPicker = <MoviePicker
        navigation={this.props.navigation}
        router={this.props.router}
        episodeLoader={this.props.episodeLoader}
        videoLoader={this.props.videoLoader}
        showProgressProvider={this.props.showProgressProvider}
        metadataProvider={this.props.metadataProvider}
        movieName={this.state.movieName}
        cancelFunction={this.cancelShowChooser.bind(this)}>
      </MoviePicker>;
    }
    var body = <div>
      <div>
        <label>Search:</label><input ref="searchbox" type="text" onChange={evt => this.search(evt.target.value)} />
      </div>
      {searchResultSection}
      {showPicker}
    </div>;


    return (
      <div>{body}</div>
    );
  }
}
