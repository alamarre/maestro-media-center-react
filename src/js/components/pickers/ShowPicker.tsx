import React from "react";

import { Button, Dialog, DialogTitle, DialogActions, DialogContent, NativeSelect } from "@material-ui/core";

import FileCache from "../../models/FileCache";
import INavigation from "../../utilities/providers/navigation/INavigation";
import Scrollable from "../ScrollableComponent";
import KeepWatching from "../../models/KeepWatchingData";
import {PlayCircleOutline} from "@material-ui/icons";

export interface ShowPickerProps {
  navOrder?: number;
  navigation: INavigation;
  showProgressProvider: any;
  videoLoader: any;

  cancelFunction: () => void;
  showName: string;
  showPath: string;
  showCache: FileCache;
  metadataProvider: any;
  episodeLoader: any;
}

export interface ShowPickerState {
  season: string;
  episode: string;
  keepWatchingData: KeepWatching;
  episodeSources: any;
  metadata: any[];
  refs: React.RefObject<HTMLButtonElement | HTMLInputElement | HTMLDivElement>[][];
  showMore: boolean[];
}

export default class ShowPicker extends React.Component<ShowPickerProps, ShowPickerState> {

  private downloadProgress: any;
  private episodeRefs : React.RefObject<HTMLDivElement>[]=[];
  private showMoreRefs : React.RefObject<HTMLDivElement>[]=[];
  private selectorRef : React.RefObject<HTMLSelectElement> = React.createRef<HTMLSelectElement>();
  private keepWatchingRef : React.RefObject<HTMLDivElement> = React.createRef<HTMLDivElement>();
  private cancelRef : React.RefObject<HTMLDivElement> = React.createRef<HTMLDivElement>();

  constructor(props) {
    super(props);
    this.state = Object.assign({ "season": null, "episode": null, refs: [], showMore: [] }, this.state);
    this.downloadProgress = {};

    props.showProgressProvider.getShowsInProgress().then(shows => {
      let seasonSet = false;
      for (const show of shows) {
        if (show.show === props.showName) {
          if (show.episode.endsWith(".mp4")) {
            show.episode = show.episode.substring(0, show.episode.indexOf(".mp4"));
          }
          this.setState({
            "season": show.season,
            "episode": show.episode,
            keepWatchingData: show,
          }, () => {
            this.loadSeasonMetadata(show.season);
          });
          seasonSet = true;
        }
      }

      if (!seasonSet) {
        const firstSeasonName = Object.keys(props.showCache.folders)[0];
        this.setSeason(firstSeasonName);
      }
    });
  }

  setSeason(season) {
    const firstEpisodeName = Object.keys(this.props.showCache.folders[season].files)[0];
    this.setState({ "season": season, "episode": firstEpisodeName, });
    this.loadSeasonMetadata(season);
  }

  async loadSeasonMetadata(season) {
    this.episodeRefs = Object.keys(this.props.showCache.folders[season].files).map(
      () => React.createRef<HTMLDivElement>());
    this.showMoreRefs = Object.keys(this.props.showCache.folders[season].files).map(
      () => React.createRef<HTMLDivElement>());
    const downloadPromises = [];
    for (const episode of Object.keys(this.props.showCache.folders[this.state.season].files)) {
      const folder = this.props.showPath + "/" + this.state.season;
      const path = `${folder}/${episode}`;
      downloadPromises.push(this.props.episodeLoader.getVideoSource(path));
    }
    Promise.all(downloadPromises).then((episodeSources) => this.setState({ episodeSources, }));
    let refs = [];
    if (this.state.keepWatchingData && season == this.state.keepWatchingData.season) {
      refs.push([this.keepWatchingRef]);
    }
    const showRefs = this.episodeRefs.map((a,i) => [this.episodeRefs[i], this.showMoreRefs[i]]);
    refs = refs.concat([[this.selectorRef]],showRefs,[[this.cancelRef]]);
    //this.selectedIndex = 0;
    this.setState({ refs, }, () => {
      //this.focusCurrent();
    });

    if (this.props.metadataProvider) {
      const metadata = await this.props.metadataProvider.getTvSeasonMetaData(this.props.showName, season);
      this.setState({ metadata, showMore: this.episodeRefs.map(() => false) }, () => {
        //this.focusCurrent();
      });
    }
  }

  setEpisode(episode) {
    this.setState({ "episode": episode, });
  }

  download(episode) {
    const files = Object.keys(this.props.showCache.folders[this.state.season].files);
    let index = -1;
    for (let i = 0; i < files.length; i++) {
      if (files[i] == episode) {
        index = i;
      }
    }
    if (this.state.episodeSources.length > index) {
      const sources = this.state.episodeSources[index];
      const url = new URL(sources.sources[0]).href + "?download=true";
      window.open(url, "_blank")
    }
  }

  /*downloadLegacy(episode) {
    const files = Object.keys(this.props.showCache.folders[this.state.season].files);
    let index = -1;
    for (let i = 0; i < files.length; i++) {
      if (files[i] == episode) {
        index = i;
      }
    }
    const folder = this.props.showPath + "/" + this.state.season;
    const path = `${folder}/${episode}`;
    this.props.offlineStorage.saveVideo({
      type: "tv",
      folder,
      index,
      episode,
      showName: this.props.showName,
      path: `TV Shows/${this.props.showName}/${this.state.season}/${episode}`,
      name: `${this.props.showName} ${this.state.season} ${episode}`,
    }, path, (progress) => {
      //this.setState({ downloadProgress$: progress, });
      this.downloadProgress[episode] = progress;
    });
  }*/

  play(episode) {
    const files = Object.keys(this.props.showCache.folders[this.state.season].files).sort(window["tvShowSort"]);
    let index = -1;
    for (let i = 0; i < files.length; i++) {
      if (files[i] == episode) {
        index = i;
      }
    }
    const folder = this.props.showPath + "/" + this.state.season;
    this.props.videoLoader.loadVideo("tv", folder, index);
  }

  render() {
    if (!this.state.season) {
      return <div></div>;
    }
    const seasons = Object.keys(this.props.showCache.folders).sort(window["tvShowSort"]).map((season) => {
      return <option key={season} value={season} > {season} </option>;
    });

    let count = 0;
    const episodes = this.state.season == null ? null : Object.keys(this.props.showCache.folders[this.state.season].files).sort(window["tvShowSort"]).map((episode, index) => {
      let downloadButton = null;
      let downloadProgress = null;
      let overview = "";
      if (this.state.metadata && count < this.state.metadata.length) {
        const metadata = this.state.metadata[count++];
        overview = metadata.overview;
      }
      const ref = this.episodeRefs[index];

      downloadButton = <button className="maestroButton roundedButton fa fa-arrow-circle-down" onClick={() => this.download(episode)
      }> </button>;
      const progress = this.downloadProgress[episode];
      if (this.state.episodeSources && this.state.episodeSources.length > index) {
        //downloadButton = <a href={new URL(this.state.episodeSources[index].sources[0]).href + "?download=true"} download>Download</a>;
      }
      if (progress && progress.state) {
        downloadProgress = <span>{progress.state}: {parseFloat(progress.progress).toFixed(2)}% </span>;
      }

      const showMoreButton =  <div ref={this.showMoreRefs[index]} tabIndex={0} style={{display: "inline-block"}} className="maestroLabelButton" onClick={() => {this.state.showMore[index] = !this.state.showMore[index]; this.setState({showMore: this.state.showMore});}} >
        <Button variant="contained" color="primary"> {this.state.showMore[index] ? "Show Less" : "Show More"} </Button>
      </div>;

      const overviewSection = this.state.showMore[index]
        ? <div style={{ marginLeft: "20px", }}> {overview} </div>
        : null;
      return <div style={{ display: "table", margin: "20px", }} key={episode} >
        <div style={{ display: "table-cell", verticalAlign: "top", }}>
          <div tabIndex={0} ref={ref} className="nooutline" onClick={() => this.play(episode)} >
            <PlayCircleOutline color="primary" ></PlayCircleOutline>
          </div>
          <span> {episode} </span>
          {showMoreButton}
          {downloadButton}
          {downloadProgress}

          {overviewSection}
        </div>
      </div>;

    });

    let keepWatchingView = null;
    if (this.state.keepWatchingData && this.state.season == this.state.keepWatchingData.season) {
      const episode = this.state.keepWatchingData.episode;
      keepWatchingView = <div>
        <div tabIndex={0} ref={this.keepWatchingRef} className="nooutline" onClick={() => this.play(episode)} >
          <PlayCircleOutline color="primary" ></PlayCircleOutline>
        </div>
        < span > Keep watching: {episode} </span>
      </div>;
    }

    const body = <div>
      <Dialog open={true} fullScreen={true} onClose={() => this.props.cancelFunction()}>
        <DialogTitle>
          {this.props.showName}
        </DialogTitle>

        <DialogContent>
          {keepWatchingView}
          <div>
            <NativeSelect inputRef={this.selectorRef} defaultValue={this.state.season} onChange={evt => this.setSeason(evt.target.value)} >
              {seasons}
            </NativeSelect>
            <div>
              <div>
              </div>
              {episodes}
            </div>
          </div>
        </DialogContent>

        <DialogActions>
          <div tabIndex={0} className="maestroLabelButton" onClick={() => this.props.cancelFunction() } ref={this.cancelRef} >
            <Button variant="contained" color="secondary"> Cancel </Button>
          </div>
        </DialogActions>
      </Dialog>
    </div>;

    return <div><Scrollable isDialog={true} navigation={this.props.navigation} refs={this.state.refs} >{body}</Scrollable></div >;
  }

}


