import React from "react";
import { Modal, } from "react-bootstrap";

const MetadataImage = require("./generic/MetadataImage");

class ShowPicker extends React.Component {

  constructor(props) {
    super(props);
    this.state = { "season": null, "episode": null, };
    this.downloadProgress = {};

    props.showProgressProvider.getShowsInProgress().then(shows => {
      let seasonSet = false;
      for (const show of shows) {
        if (show.show === props.showName) {
          if(show.episode.endsWith(".mp4")) {
            show.episode = show.episode.substring(0, show.episode.indexOf(".mp4"));
          }
          this.setState({
            "season": show.season,
            "episode": show.episode,
            "keepWatchingData": show,
          });
          this.loadSeasonMetadata(show.season);
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
    if(this.props.metadataProvider) {
      const metadata = await this.props.metadataProvider.getTvSeasonMetaData(this.props.showName, season);
      this.setState({metadata,});
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
      this.setState({ downloadProgress$: progress, });
      this.downloadProgress[episode] = progress;
    });
  }

  play(episode) {
    const files = Object.keys(this.props.showCache.folders[this.state.season].files);
    let index = -1;
    for (let i = 0; i < files.length; i++) {
      if (files[i] == episode) {
        index = i;
      }
    }
    const folder = this.props.showPath + "/" + this.state.season;
    //let url = "view?type=tv&index="+index+"&folder="+encodeURIComponent(folder)+"&file="+encodeURIComponent(episode);
    //this.props.router.push(url);
    this.props.videoLoader.loadVideo("tv", folder, index);
  }

  render() {
    if (!this.state.season) {
      return <div></div>;
    }

    const seasons = Object.keys(this.props.showCache.folders).sort(window.tvShowSort).map((season) => {
      return <option key={season} value={season}>{season}</option>;
    });
    let count = 0;
    const episodes = this.state.season == null ? null : Object.keys(this.props.showCache.folders[this.state.season].files).sort(window.tvShowSort).map(episode => {
      let downloadButton = null;
      let downloadProgress = null;
      let overview = "";
      if(this.state.metadata && count < this.state.metadata.length) {
        const metadata = this.state.metadata[count++];
        overview = metadata.overview;
      }

      if (this.props.offlineStorage.canStoreOffline()) {
        downloadButton = <button className="maestroButton roundedButton fa fa-arrow-circle-down" onClick={() => this.download(episode)}></button>;
        const progress = this.downloadProgress[episode];
        if (progress && progress.state) {
          downloadProgress = <span>{progress.state}: {parseFloat(progress.progress).toFixed(2)}%</span>;
        }
      }
      return <div style={{display: "table", margin: "20px",}} key={episode}>
        <MetadataImage style={{display: "table-cell", verticalAlign: "top",}} 
          width={227} height={127} type="episode" name={episode} show={this.props.showName}
          season={this.state.season}  ></MetadataImage>
        <div style={{display: "table-cell", verticalAlign: "top",}}>
          <button className="maestroButton roundedButton fa fa-play" onClick={() => this.play(episode)}></button>
          <span>{episode}</span>
          {downloadButton}
          {downloadProgress}
          <div style={{marginLeft: "20px",}}>{overview}</div>
        </div>
      </div>;

    });

    let keepWatchingView = null;
    if (this.state.keepWatchingData && this.state.season == this.state.keepWatchingData.season) {
      const episode = this.state.keepWatchingData.episode;
      keepWatchingView = <div>
        <button className="maestroButton roundedButton fa fa-play c" onClick={() => this.play(episode)}></button>
        <span>Keep watching: {episode}</span>
      </div>;
    }

    const body = <div>
      <Modal show={true} animation={false} onHide={() => this.props.cancelFunction()}>
        <Modal.Header>
          <Modal.Title>{this.props.showName}</Modal.Title>
        </Modal.Header>

        <Modal.Body>

          {keepWatchingView}
          <div>
            <select defaultValue={this.state.season} onChange={evt => this.setSeason(evt.target.value)}>
              {seasons}
            </select>
          </div>
          <div>
          </div>
          {episodes}
        </Modal.Body>
        <Modal.Footer>
          <button className="btn btn-secondary" onClick={() => this.props.cancelFunction()}>Cancel</button>
        </Modal.Footer>
      </Modal>
    </div>;

    return (
      <div>{body}</div>
    );
  }
}

export default ShowPicker;
