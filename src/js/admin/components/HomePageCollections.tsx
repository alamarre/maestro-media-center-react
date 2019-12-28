const React = require("react");

const Carousel = require("./generic/Carousel");
const ShowPicker = require("./ShowPicker");
const MetadataImage = require("./generic/MetadataImage");

import ISimpleDataProvider from "../../utilities/providers/data/ISimpleDataProvider";
import RecentlyUpdatedTvShow from "../../models/RecentlyUpdatedTvShow";

export interface NewShowsProps {
  showProvider: ISimpleDataProvider<RecentlyUpdatedTvShow>
}

export default class NewShows extends React.Component<NewShowsProps, {}> {
  constructor(props) {
    super(props);
    this.state = { shows: [], };
    this.dragging = false;
    this.load();
  }

  async load() {
    const shows = (await this.props.showProvider.list())
      .sort((a, b) => b.time - a.time)
      .map(v => v.show);
    this.setState({ shows, });
  }

  isDragging(dragging) {
    this.dragging = dragging;
  }

  async play(showName) {
    if (!this.dragging) {
      const showPath = await this.props.cacheProvider.getShowPath(showName);
      const cachePath = await this.props.cacheProvider.getCacheFromPath(showPath);
      this.setState({ showName, showPath, cachePath });
    }
  }

  cancelChooser() {
    this.setState({ "showName": null, });
  }

  render() {
    if (this.state.shows.length === 0) {
      return <div>Loading</div>;
    }
    const shows = this.state.shows.slice(0, 30).map((show) => {

      const name = show;
      return <div style={{ "display": "inline-block", width: "150px", margin: "0 0 0 0", padding: "0 0 0 0", height: "350px", overflow: "hidden", textAlign: "left", verticalAlign: "top", wordWrap: "break-word", }}
        key={show} onClick={this.play.bind(this, show)}>
        <MetadataImage style={{ display: "block", margin: "0 0 0 0", padding: "0 0 0 0", }} width={150} height={225} type="tv" name={show}></MetadataImage>
        {name}
      </div>;
    });

    let videosView = <Carousel navOrder={this.props.navOrder} navigation={this.props.navigation} isDragging={this.isDragging.bind(this)} itemWidth={150} height={350}>{shows}</Carousel>;

    if (this.state.shows.length > 0) {
      videosView = <div>
        <div>New Episodes</div>
        {videosView}
      </div>;
    }

    let showPicker = null;

    if (this.state.showName) {
      showPicker = <ShowPicker
      router={this.props.router}
      navigation={this.props.navigation}
      offlineStorage={this.props.offlineStorage}
      videoLoader={this.props.videoLoader}
      showProgressProvider={this.props.showProgressProvider}
      showName={this.state.showName}
      showPath={this.state.showPath}
      cancelFunction={this.cancelChooser.bind(this)}
      showCache={this.state.cachePath}
      >
      </ShowPicker>;
    }
    return (
      <div>
        {videosView}
        {showPicker}
      </div>
    );
  }
}
