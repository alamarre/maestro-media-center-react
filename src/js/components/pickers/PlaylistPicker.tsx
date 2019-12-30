import React from "react";
import { Modal, } from "react-bootstrap";
import INavigation from "../../utilities/providers/navigation/INavigation";
import Scrollable from "../ScrollableComponent";
import KeepWatching from "../../models/KeepWatchingData";
import PlaylistEntry from "../../models/PlaylistEntry";

export interface PlaylistPickerProps {
  navOrder?: number;
  navigation: INavigation;
  playlistManager: any;
  offlineStorage: any;
  showProgressProvider: any;
  videoLoader: any;
  router: any;
  cancelFunction: () => void;
  playlistName: string;
  metadataProvider: any;
  episodeLoader: any;
}

export interface PlaylistPickerState {
  refs: string[];
  keepWatchingData: KeepWatching;
  playlist: PlaylistEntry[];
}

export default class PlaylistPicker extends React.Component<PlaylistPickerProps, PlaylistPickerState> {

  constructor(props) {
    super(props, []);
    this.state = Object.assign({ "playlist": null, }, this.state);
    this.loadPlaylistData();
  }

  async loadPlaylistData() {
    const playlistInfo = await this.props.playlistManager.getPlaylist(this.props.playlistName);
    const playlist: PlaylistEntry[] = playlistInfo.playlist;
    let keepWatchingData = await this.props.showProgressProvider.getShowProgress("playlist");

    let refs = [];
    if (!keepWatchingData || keepWatchingData.season !== this.props.playlistName) {
      keepWatchingData = null;
    } else {
      refs.push("keepwatching");
    }

    const items = playlist.map((x, index) => `playlist-${index}`);
    refs = refs.concat(items).concat(["cancel",]);
    this.setState({ playlist, keepWatchingData, refs, }, () => {
      //this.focusCurrent();
    });
  }

  play(video) {
    const index = this.state.playlist.indexOf(video);
    const folder = this.props.playlistName;
    this.props.videoLoader.loadVideo("playlist", folder, index);
  }

  render() {
    if (!this.state.playlist) {
      return <div></div>;
    }

    const videos = this.state.playlist.map((video, index) => {
      const ref = `playlist-${index}`;
      return <div key={index}>
        <button ref={ref} className="maestroButton roundedButton fa fa-play" onClick={() => this.play(video)}></button>
        <span>{video.file}</span>
      </div>;

    });

    let keepWatchingView = null;
    if (this.state.keepWatchingData) {
      const index = this.state.keepWatchingData.episode;
      const video = this.state.playlist[index];
      keepWatchingView = <div>
        <button ref="keepwatching" className="maestroButton roundedButton fa fa-play c" onClick={() => this.play(video)}></button>
        <span>Keep watching: {video.file}</span>
      </div>;
    }

    const body = <div>
      <Modal show={true} animation={false} onHide={() => this.props.cancelFunction()}>
        <Modal.Header>
          <Modal.Title>{this.props.playlistName}</Modal.Title>
        </Modal.Header>

        <Modal.Body>

          {keepWatchingView}
          <hr style={{ backgroundColor: "white", }} ></hr>
          {videos}
        </Modal.Body>
        <Modal.Footer>
          <button ref="cancel" className="btn btn-secondary" onClick={() => this.props.cancelFunction()}>Cancel</button>
        </Modal.Footer>
      </Modal>
    </div>;
    const parentRefs = () => this.refs;
    return (
      <div><Scrollable refNames={this.state.refs} parentRefs={parentRefs} navigation={this.props.navigation} isDialog={true} >{body}</Scrollable></div>
    );
  }
}


