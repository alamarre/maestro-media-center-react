const React = require("react");

const ShowPicker = require("./ShowPicker");
const MoviePicker = require("./pickers/MovieDetails");

class VideosListing extends React.Component {
  constructor(props) {
    super(props);
    this.state = { root: "", folders: [], files: [], };
    

    if(this.props.router.params && this.props.router.params.videoType) {
      this.fetchFolder(this.props.router.params.videoType);
    } else if (this.props.episodeLoader) {
      this.props.episodeLoader.getListingPromise("").then(this.loadFolder.bind(this));
    }
  }

  componentWillReceiveProps(nextProps) {
    if(nextProps.router.params) {
      const newRoot = nextProps.router.params.videoType || "";
      this.setState({ root: newRoot, });
      this.props.episodeLoader.getListingPromise(newRoot).then(this.loadFolder.bind(this));
    }
  }

  fetchFolder(folder) {
    var newRoot = this.state.root + "/" + folder;
    if(this.props.router.params && this.props.router.params.videoType != folder) {
      this.props.router.push(`/videos${newRoot}`);
    }
    this.setState({ root: newRoot, });
    this.props.episodeLoader.getListingPromise(newRoot).then(this.loadFolder.bind(this));
  }

  loadFolder(folderData) {
    this.setState({ "folders": folderData.folders, "files": folderData.files, });
  }

  selectSource(item) {
    this.props.cacheProvider.getCacheFromPath(item.path)
      .then(cachePath => {
        this.setState({ showName: item.name, showPath: item.path, cachePath: cachePath, });
      });
  }

  cancelShowChooser() {
    this.setState({ "showName": null, movieName: null, });
  }

  loadVideo(movieName) {
    this.setState({movieName,});
  }

  render() {
    var folders = this.state.folders.map((folder) => {
      return <div key={folder} onClick={this.fetchFolder.bind(this, folder)}>{folder}</div>;
    });

    //var index = 0;
    var files = this.state.files.map((file) => {
      const fileName = (file.name) ? file.name : file;
      //const folder = (file.path) ? file.path.substring(0, file.path.lastIndexOf("/")) : self.state.root;

      if (file.type && file.type == "tv") {
        const imageSource = `${this.props.imageRoot}/${window.accountId}/50x75/tv/show/${file.name}.png`;
        return <div style={{ margin: "20px", }} key={fileName} onClick={() => this.selectSource(file)} >
          <img style={{ border: "white 1px solid", marginRight: "10px", }} src={imageSource} width="50px" height="75px" />
          {fileName}
        </div>;
      }

      const imageSource = `${this.props.imageRoot}/${window.accountId}/50x75/movies/${file.name}.png`;

      return <div style={{ margin: "20px", }} key={fileName} onClick={this.loadVideo.bind(this, fileName)} >
        <img style={{ border: "white 1px solid", marginRight: "10px", }} src={imageSource} width="50px" height="75px" />
        {fileName}
      </div>;
    });

    let showPicker = null;

    if (this.state.showName) {
      showPicker = <ShowPicker
        router={this.props.router}
        videoLoader={this.props.videoLoader}
        showProgressProvider={this.props.showProgressProvider}
        offlineStorage={this.props.offlineStorage}
        showName={this.state.showName}
        showPath={this.state.showPath}
        cancelFunction={this.cancelShowChooser.bind(this)}
        showCache={this.state.cachePath}>
      </ShowPicker>;
    } else if (this.state.movieName) {
      showPicker = <MoviePicker
        router={this.props.router}
        metadataProvider={this.props.metadataProvider}
        videoLoader={this.props.videoLoader}
        showProgressProvider={this.props.showProgressProvider}
        offlineStorage={this.props.offlineStorage}
        movieName={this.state.movieName}
        cancelFunction={this.cancelShowChooser.bind(this)}>
      </MoviePicker>;
    }
    return (
      <div>
        {folders}
        {files}
        {showPicker}
      </div>
    );
  }
}

module.exports = VideosListing;
