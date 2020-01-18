import React from "react";

import Carousel from "./generic/Carousel";
import ShowPicker from "./ShowPicker";
import MetadataImage from "./generic/MetadataImage";

import ISimpleDataProvider from "../utilities/providers/data/ISimpleDataProvider";
import RecentlyUpdatedTvShow from "../models/RecentlyUpdatedTvShow";
import INavigation from "../utilities/providers/navigation/INavigation";
import ICacheProvider from "../utilities/providers/ICacheProvider";
import FileCache from "../models/FileCache";

export interface NewShowsProps {
  showProvider: ISimpleDataProvider<RecentlyUpdatedTvShow>;
  navOrder: number;
  metadataProvider: any;
  episodeLoader: any;
  cacheProvider: ICacheProvider;
  navigation: INavigation;
  showProgressProvider: any;
  videoLoader: any;

}

export interface NewShowsState {
  shows: string[];
  showName: string;
  showPath: string;
  cachePath: FileCache;
}

export default class NewShows extends React.Component<NewShowsProps, NewShowsState> {
  private dragging: boolean;
  constructor(props: NewShowsProps) {
    super(props);
    this.state = { shows: [], showName: null, showPath: null, cachePath: null, };
    this.dragging = false;
    this.load();
  }

  async load() {
    const shows: string[] = (await this.props.showProvider.list())
      .sort((a: RecentlyUpdatedTvShow, b: RecentlyUpdatedTvShow) => b.time - a.time)
      .map((v: RecentlyUpdatedTvShow) => v.show);
    this.setState({ shows, });
  }

  isDragging(dragging) {
    this.dragging = dragging;
  }

  async play(showName: string) {
    if (!this.dragging) {
      const showPath = await this.props.cacheProvider.getShowPath(showName);
      const cachePath = await this.props.cacheProvider.getCacheFromPath(showPath);
      this.setState({ showName, showPath, cachePath, });
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
        navigation={this.props.navigation}
        episodeLoader={this.props.episodeLoader}
        videoLoader={this.props.videoLoader}
        showProgressProvider={this.props.showProgressProvider}
        showName={this.state.showName}
        showPath={this.state.showPath}
        metadataProvider={this.props.metadataProvider}
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
