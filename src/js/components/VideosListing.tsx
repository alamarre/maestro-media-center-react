import React from "react";

import ShowPicker from "./ShowPicker";
import MoviePicker from "./pickers/MovieDetails";
import ScrollableComponent from "./ScrollableComponent";
import CacheBasedEpisodeProvider from "../utilities/providers/CacheBasedEpisodeProvider";
import CacheProvider from "../utilities/providers/CacheProvider";
import INavigation from "../utilities/providers/navigation/INavigation";
import ShowProgressProvider from "../utilities/providers/ShowProgressProvider";
import MetadataProvider from "../utilities/providers/MetadataProvider";
import VideoLoader from "../utilities/VideoLoader";
import FileCache from "../models/FileCache";
import SearchResult from "../models/SearchResult";

export interface VideosListingProps {
  router: any;
  episodeLoader: CacheBasedEpisodeProvider;
  cacheProvider: CacheProvider;
  navigation: INavigation;
  showProgressProvider: ShowProgressProvider;
  metadataProvider: MetadataProvider;
  videoLoader: VideoLoader;
  imageRoot: string;
}

export interface VideosListingState {
  rootPath: string;
  folders: string[];
  files: SearchResult[];
  showName?: string;
  movieName?: string;
  showPath?: string;
  cachePath?: FileCache;
  refs: string[];
}

export default class VideosListing extends React.Component<VideosListingProps, VideosListingState> {
  constructor(props) {
    super(props);
    this.state = { rootPath: "", folders: [], files: [], refs: [], };
  }

  componentDidMount() {
    if (this.props.router.params && this.props.router.params.videoType) {
      this.fetchFolder(this.props.router.params.videoType);
    } else if (this.props.episodeLoader) {
      this.props.episodeLoader.getListingPromise("").then(this.loadFolder.bind(this));
    }
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.router.params) {
      const newRoot = nextProps.router.params.videoType || "";
      this.setState({ rootPath: newRoot, }, () => {
        this.props.episodeLoader.getListingPromise(newRoot).then(this.loadFolder.bind(this));
      });
    }
  }

  async fetchFolder(folder) {
    var newRoot = this.state.rootPath + "/" + folder;

    if (this.props.router.params && this.props.router.params.videoType != folder) {
      this.props.router.push(`/videos${newRoot}`);
    }
    this.setState({ rootPath: newRoot, });
    const data = await this.props.episodeLoader.getListingPromise(newRoot);
    await this.loadFolder(data);
  }

  loadFolder(folderData) {
    let refs = [];
    refs = refs.concat(
      folderData.folders.map((f, i) => `folder-${i}`)
    ).concat(
      folderData.files.map((f, i) => `file-${i}`)
    );

    this.setState({ "folders": folderData.folders, refs, "files": folderData.files, }, () => {
      //this.focus();
    });
  }

  async selectSource(item: any) {
    const cachePath = await this.props.cacheProvider.getCacheFromPath(item.path);

    this.setState({ showName: item.name, showPath: item.path, cachePath: cachePath, });
  }

  cancelShowChooser() {
    this.setState({ "showName": null, movieName: null, }, () => {
      this.props.navigation.focusDialog(this);
    });
  }

  loadVideo(movieName) {
    this.setState({ movieName, });
  }

  render() {
    var folders = this.state.folders.map((folder, i) => {
      const ref = `folder-${i}`;
      return <div key={folder}><button className="maestroButton" key={folder} ref={ref} onClick={this.fetchFolder.bind(this, folder)}>{folder}</button></div>;
    });

    //var index = 0;
    var files = this.state.files.map((file, i) => {
      const fileName = file.name;
      //const folder = (file.path) ? file.path.substring(0, file.path.lastIndexOf("/")) : self.state.root;

      const ref = `file-${i}`;
      if (file.type && file.type == "tv") {
        const imageSource = `${this.props.imageRoot}/${window["accountId"]}/50x75/tv/show/${file.name}.png`;

        return <button className="maestroButton" ref={ref} style={{ margin: "20px", display: "block", }} key={fileName} onClick={() => this.selectSource(file)} >
          <img style={{ border: "white 1px solid", marginRight: "10px", }} src={imageSource} width="50px" height="75px" />
          {fileName}
        </button>;
      }

      const imageSource = `${this.props.imageRoot}/${window["accountId"]}/50x75/movies/${file.name}.png`;

      return <button ref={ref} className="maestroButton" style={{ margin: "20px", display: "block", }} key={fileName} onClick={this.loadVideo.bind(this, fileName)} >
        <img style={{ border: "white 1px solid", marginRight: "10px", }} src={imageSource} width="50px" height="75px" />
        {fileName}
      </button>;
    });

    let showPicker = null;

    if (this.state.showName) {
      showPicker = <ShowPicker
        navigation={this.props.navigation}
        router={this.props.router}
        metadataProvider={this.props.metadataProvider}
        videoLoader={this.props.videoLoader}
        episodeLoader={this.props.episodeLoader}
        showProgressProvider={this.props.showProgressProvider}
        showName={this.state.showName}
        showPath={this.state.showPath}
        cancelFunction={this.cancelShowChooser.bind(this)}
        showCache={this.state.cachePath}>
      </ShowPicker>;
    } else if (this.state.movieName) {
      showPicker = <MoviePicker
        episodeLoader={this.props.episodeLoader}
        navigation={this.props.navigation}
        router={this.props.router}
        metadataProvider={this.props.metadataProvider}
        videoLoader={this.props.videoLoader}
        showProgressProvider={this.props.showProgressProvider}
        movieName={this.state.movieName}
        cancelFunction={this.cancelShowChooser.bind(this)}>
      </MoviePicker>;
    }

    const parentRefs = () => this.refs;


    return (
      <div>
        <ScrollableComponent key={this.state.rootPath} isDialog={true} parentRefs={parentRefs} navigation={this.props.navigation} refNames={this.state.refs}>
          {folders}
          {files}
          {showPicker}
        </ScrollableComponent>
      </div >
    );
  }
}


