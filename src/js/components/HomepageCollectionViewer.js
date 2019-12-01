const React = require("react");

const ShowPicker = require("./ShowPicker");

const Carousel = require("./generic/Carousel");
const MoviePicker = require("./pickers/MovieDetails");
const MetadataImage = require("./generic/MetadataImage");

class HomepageCollectionViewer extends React.Component {
  constructor(props) {
    super(props);
    this.state = { root: "", collections: [], };
    this.dragging = false;
    props.homepageCollectionManager.getAllCollections().then(collections => {
      for (const collection of collections) {
        collection.items = collection.items.sort((a, b) => window.tvShowSort(a.name, b.name));
      }
      this.setState({ collections, });
    });
  }

  componentDidMount() {

  }

  isDragging(dragging) {
    this.dragging = dragging;
  }

  play(movie) {
    if (!this.dragging) {
      this.setState({ movieName: movie.name });
    }
  }


  cancelChooser() {
    this.setState({ "movieName": null, });
  }

  isDragging(dragging) {
    this.dragging = dragging;
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
        return <div style={{ "display": "inline-block", width: "150px", margin: "0 0 0 0", padding: "0 0 0 0", height: "350px", overflow: "hidden", textAlign: "left", verticalAlign: "top", wordWrap: "break-word", }}
          key={video.name} onClick={this.play.bind(this, video)}>
          <MetadataImage style={{ display: "block", margin: "0 0 0 0", padding: "0 0 0 0", }} width={150} height={225} type={video.type} name={video.name} ></MetadataImage>
          {video.name}
        </div>
      });
      const navOrder = this.props.navOrder ? this.props.navOrder + index : null;
      return <div key={collection.name}>
        <div>{collection.name}</div>
        <Carousel navOrder={navOrder} navigation={this.props.navigation} isDragging={this.isDragging.bind(this)} itemWidth={150} height={350}>{videos}</Carousel>
      </div>
    });

    let showPicker = null;

    if (this.state.movieName) {
      showPicker = <MoviePicker
        navigation={this.props.navigation}
        router={this.props.router}
        episodeLoader={this.props.episodeLoader}
        offlineStorage={this.props.offlineStorage}
        videoLoader={this.props.videoLoader}
        playlistManager={this.props.playlistManager}
        showProgressProvider={this.props.showProgressProvider}
        metadataProvider={this.props.metadataProvider}
        movieName={this.state.movieName}
        cancelFunction={this.cancelChooser.bind(this)}>
      </MoviePicker>;
    }
    if (this.state.showName) {
      showPicker = <ShowPicker
        router={this.props.router}
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

module.exports = HomepageCollectionViewer;
