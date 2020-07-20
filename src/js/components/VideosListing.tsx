import React from "react";

import ShowPicker from "./pickers/ShowPicker";
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
import MetadataImage from "../components/generic/MetadataImage";
import Grid from "../components/generic/Grid";

import { RouteComponentProps, } from "react-router-dom";

type TParams = { videoType: string };

export interface VideosListingProps extends RouteComponentProps<TParams> {
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
  fileRefs: React.RefObject<HTMLDivElement>[];
}

export default class VideosListing extends React.Component<VideosListingProps, VideosListingState> {
  private fileChooserRef : React.Ref<Grid>;
  constructor(props) {
    super(props);
    this.fileChooserRef = React.createRef<Grid>();
    this.state = { rootPath: "", folders: [], files: [], refs: [], fileRefs: [] };
  }

  componentDidMount() {
    if (this.props.match.params && this.props.match.params.videoType) {
      this.fetchFolder(this.props.match.params.videoType);
    } else if (this.props.episodeLoader) {
      this.props.episodeLoader.getListingPromise("").then(this.loadFolder.bind(this));
    }
  }

  componentDidUpdate(prevProps: VideosListingProps) {
    if (prevProps.match.params?.videoType != this.props.match.params?.videoType) {
      const newRoot = this.props.match.params.videoType || "";
      this.setState({ rootPath: newRoot, }, () => {
        this.props.episodeLoader.getListingPromise(newRoot).then(this.loadFolder.bind(this));
      });
    }
  }

  async fetchFolder(folder) {
    var newRoot = this.state.rootPath + "/" + folder;

    if (this.props.match.params && this.props.match.params.videoType != folder) {
      this.props.history.push(`/videos${newRoot}`);
    }
    this.setState({ rootPath: newRoot, });
    const data = await this.props.episodeLoader.getListingPromise(decodeURIComponent(newRoot));
    await this.loadFolder(data);
  }

  loadFolder(folderData) {
    let refs = [];
    refs = refs.concat(
      folderData.folders.map((f, i) => `folder-${i}`)
    ).concat(
      folderData.files.map((f, i) => `file-${i}`)
    );
    const fileRefs : React.RefObject<HTMLDivElement>[] = folderData.files.map(() => React.createRef<HTMLDivElement>());

    this.setState({ "folders": folderData.folders, refs, "files": folderData.files, fileRefs }, () => {
      //this.focus();
    });
  }

  async selectSource(item: any) {
    const cachePath = await this.props.cacheProvider.getCacheFromPath(item.path);

    this.setState({ showName: item.name, showPath: item.path, cachePath: cachePath, });
  }

  cancelShowChooser() {
    this.setState({ "showName": null, movieName: null, }, () => {
      if(this.state.files.length > 0) {
        return this.props.navigation.focusDialog(this.fileChooserRef["current"]);
      }
      this.props.navigation.focusDialog(this);
    });
  }

  loadVideo(movieName) {
    this.setState({ movieName, });
  }

  render() {
    var folders = this.state.folders.map((folder, i) => {
      const ref = `folder-${i}`;
      return <div key={folder}><button className="maestroLabelButton" key={folder} ref={ref} onClick={this.fetchFolder.bind(this, folder)}>{folder}</button></div>;
    });

    //var index = 0;
    var files = this.state.files.map((file, i) => {
      const fileName = file.name;
      //const folder = (file.path) ? file.path.substring(0, file.path.lastIndexOf("/")) : self.state.root;

      const ref = this.state.fileRefs[i];
      if (file.type && file.type == "tv") {


        //const imageSource = `${this.props.imageRoot}/${window["accountId"]}/50x75/tv/show/${file.name}.png`;

        /*return <button className="maestroButton" ref={ref} style={{ margin: "20px", display: "block", }} key={fileName} onClick={() => this.selectSource(file)} >
          <img style={{ border: "white 1px solid", marginRight: "10px", }} src={imageSource} width="50px" height="75px" />
          {fileName}
        </button>;*/
      }

      const clickFunction = file.type == "tv" ? () => this.selectSource(file) : this.loadVideo.bind(this, fileName);

      return <div style={{ display: "inline", }} key={fileName} ref={ref} tabIndex={0} onClick={clickFunction}>
        <MetadataImage key={fileName} displayNameOnFail={true} style={{ display: "inline-block", margin: "0 0 0 0", padding: "0 0 0 0", }} width={150} height={225} type={file.type} name={file.name} ></MetadataImage>
      </div>;
      //const imageSource = `${this.props.imageRoot}/${window["accountId"]}/50x75/movies/${file.name}.png`;

      /*return <button ref={ref} className="maestroButton" style={{ margin: "20px", display: "block", }} key={fileName} onClick={this.loadVideo.bind(this, fileName)} >
        <img style={{ border: "white 1px solid", marginRight: "10px", }} src={imageSource} width="50px" height="75px" />
        {fileName}
      </button>*/


    });

    let showPicker = null;

    if (this.state.showName) {
      showPicker = <ShowPicker
        navigation={this.props.navigation}
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
        metadataProvider={this.props.metadataProvider}
        videoLoader={this.props.videoLoader}
        showProgressProvider={this.props.showProgressProvider}
        movieName={this.state.movieName}
        cancelFunction={this.cancelShowChooser.bind(this)}>
      </MoviePicker>;
    }

    const parentRefs = () => this.refs;
    const fileInfo = files.length == 0 ? files :
      <Grid isDialog={true} ref={this.fileChooserRef} navigation={this.props.navigation} refs={this.state.fileRefs}>
        {files}
      </Grid>;

    const folderPicker = files.length > 0 ? null
      : <ScrollableComponent key={this.state.rootPath} isDialog={true} parentRefs={parentRefs} navigation={this.props.navigation} refNames={this.state.refs}>
        {folders}
      </ScrollableComponent>;
    return (
      <div>
        {folderPicker}
        {fileInfo}
        {showPicker}
      </div >
    );
  }
}


