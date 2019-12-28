const React = require("react");
const { Link, } = require("react-router");
const EasyInputComponent = require("./EasyInputComponent");

const SearchResults = require("./SearchResults");
const KeepWatching = require("./KeepWatching");

const NewMovies = require("./NewMovies");
import NewShows from "./NewShows";
const HomePageCollectionViewer = require("./HomePageCollectionViewer");
const ClickableButton = require("./generic/ClickableButton");

class Home extends EasyInputComponent {

  constructor(props) {
    super(props);
    this.state = { showSettings: false, collectionCount: 0, hasOfflineVideos: false, hideSettings: !(window.maestroSettings && window.maestroSettings.NEVER_HIDE_SETTINGS), };
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
          offlineStorage={this.props.offlineStorage}
          collectionsManager={this.props.collectionsManager}
          playlistManager={this.props.playlistManager}
          imageRoot={this.props.imageRoot}
          router={this.props.router}
          videoLoader={this.props.videoLoader}
          searcher={this.props.searcher}
          cacheProvider={this.props.cacheProvider}
          metadataProvider={this.props.metadataProvider}
          showProgressProvider={this.props.showProgressProvider} />
      </div>
      <div>
        <KeepWatching navOrder={1} navigation={this.props.navigation} imageRoot={this.props.imageRoot} metadataProvider={this.props.metadataProvider} router={this.props.router} videoLoader={this.props.videoLoader} searcher={this.props.searcher} cacheProvider={this.props.cacheProvider} showProgressProvider={this.props.showProgressProvider} />
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

export default Home;
