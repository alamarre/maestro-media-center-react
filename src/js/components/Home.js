const React = require("react");
const { Link, } = require("react-router");
const EasyInputComponent = require("./EasyInputComponent");

const SearchResults = require("./SearchResults");
const KeepWatching = require("./KeepWatching");
const SettingsComponent = require("./Settings");

const NewMovies = require("./NewMovies");
const HomePageCollectionViewer = require("./HomePageCollectionViewer");
const ClickableButton = require("./generic/ClickableButton");

class Home extends EasyInputComponent {

  constructor(props) {
    super(props);
    this.state = { showSettings: false, hasOfflineVideos: false, hideSettings: !(window.maestroSettings && window.maestroSettings.NEVER_HIDE_SETTINGS), };
  }

  componentWillMount() {
    if (!this.props.authTokenManager.isAuthenticated() && this.props.router.location.pathname != "/login") {
      this.props.router.push("/login");
    } else if (!this.props.authTokenManager.isProfileSet() && this.props.router.location.pathname != "/profile") {
      this.props.router.push("/profile");
    } else {
      this.props.accountProvider.getAccountId().then(accountInfo => {
        window.accountId = accountInfo.accountId;
        this.forceUpdate();
      });
    }

    this.props.videoLoader.setRouter(this.props.router);

    document.addEventListener("maestro-load-video", (event) => {
      event = event.detail;
      //this.props.videoLoader.loadVideo(event.type, event.folder, event.index);
      this.props.router.push(`/view?type=${event.type}&index=${event.index}&folder=${event.folder}&profile=${event.profile}`);
    });

    document.addEventListener("maestro-offline-change", (event) => {
      event = event.detail;
      //this.props.videoLoader.loadVideo(event.type, event.folder, event.index);
      this.setState({ hasOfflineVideos: event.offline, });
    });

    document.addEventListener("mousemove", this.showSettingsTemporarily.bind(this));
    document.body.addEventListener("click", this.showSettingsTemporarily.bind(this), true);
  }

  componentDidUpdate(prevProps) {
    if (this.props.location !== prevProps.location) {
      this.props.navigation.clear();
      if (!window.accountId) {
        this.props.accountProvider.getAccountId().then(accountInfo => {
          window.accountId = accountInfo.accountId;
          this.forceUpdate();
        });
      }
    }
  }

  showSettingsTemporarily() {
    if (window.maestroSettings && window.maestroSettings.NEVER_HIDE_SETTINGS) {
      return;
    }
    this.setState({ hideSettings: false, });
    if (this.hideSettingsTimeout) {
      window.clearTimeout(this.hideSettingsTimeout);
    }

    this.hideSettingsTimeout = window.setTimeout(() => {
      this.setState({ hideSettings: true, });
    }, 5000);
  }

  goHome() {
    this.props.router.push("/");
  }

  render() {

    //const getChristmasShows = () => this.props.cacheProvider.getCacheFromPath("Movies/Christmas");
    const settingsView = this.state.showSettings ?
      <SettingsComponent router={this.props.router} remoteController={this.props.remoteController} webSocketSender={this.props.webSocketSender} settingsManager={this.props.settingsManager} />
      : null;
    let settingsDisplay = this.state.hideSettings ? "none" : "block";

    let homeButton = null;
    if (["/login", "/profile", "/remote",].includes(this.props.router.location.pathname)) {
      settingsDisplay = "none";
    } else if (!["/",].includes(this.props.router.location.pathname)) {
      homeButton = <button className="maestroButton fa fa-home" onClick={() => this.goHome()}></button>;
    }


    const settingsSection = <div style={{ display: settingsDisplay, }} className="settings">
      <div style={{ textAlign: "right", zIndex: 10, }}>

        {homeButton}
        <button className="maestroButton fa fa-cog" onClick={this.toggleSetting} name="showSettings"></button>
      </div>

      {settingsView}
    </div>;

    if (this.props.router.location.pathname !== "/login"
      && this.props.router.location.pathname != "/profile"
      && !window.accountId) {
      return <div>{settingsSection}</div>;
    }

    let offlineLink = null;
    if (this.props.offlineStorage.canStoreOffline()) {
      offlineLink = <div><Link className="nostyle" to="offline">Offline Videos</Link></div>;
    }

    const remoteLink = (this.props.settingsManager.get("playToRemoteClient") && this.props.settingsManager.get("playToRemoteClient") != "") ?
      <Link className="nostyle" to="remote">Remote Control</Link>
      : null;
    var body = this.props.children || <div>
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
        <HomePageCollectionViewer navOrder={3} {...this.props} ></HomePageCollectionViewer>
      </div>
      <ClickableButton navigation={this.props.navigation} navOrder={4} to="videos">Browse the collection</ClickableButton>
      <div>{remoteLink}</div>
      {offlineLink}
    </div>;
    return (
      <div>{settingsSection}{body}</div>
    );
  }
}

module.exports = Home;
