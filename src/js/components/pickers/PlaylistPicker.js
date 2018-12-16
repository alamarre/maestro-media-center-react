import React from 'react';
import { Modal } from 'react-bootstrap';

class PlaylistPicker extends React.Component {

  constructor(props) {
    super(props);
    this.state = { "playlist": null };
    this.loadPlaylistData();
  }

  async loadPlaylistData() {
    const playlistInfo = await this.props.playlistManager.getPlaylist(this.props.playlistName);
    const playlist = playlistInfo.playlist;
    let keepWatchingData = await this.props.showProgressProvider.getShowProgress("playlist");
    if (!keepWatchingData || keepWatchingData.season !== this.props.playlistName) {
      keepWatchingData = null;
    }
    this.setState({ playlist, keepWatchingData });
  }

  play(video) {
    const index = this.state.playlist.indexOf(video);
    let folder = this.props.playlistName;
    this.props.videoLoader.loadVideo("playlist", folder, index);
  }

  render() {
    if (!this.state.playlist) {
      return <div></div>;
    }

    const videos = this.state.playlist.map(video => {
      const index = this.state.playlist.indexOf(video);
      return <div key={index}>
        <button className="maestroButton roundedButton fa fa-play" onClick={evt => this.play(video)}></button>
        <span>{video.file}</span>
      </div>;

    });

    let keepWatchingView = null;
    if (this.state.keepWatchingData) {
      let index = this.state.keepWatchingData.episode;
      let video = this.state.playlist[index];
      keepWatchingView = <div>
        <button className="maestroButton roundedButton fa fa-play c" onClick={evt => this.play(video)}></button>
        <span>Keep watching: {video.file}</span>
      </div>;
    }

    let body = <div>
      <Modal show={true} animation={false} onHide={evt => this.props.cancelFunction()}>
        <Modal.Header>
          <Modal.Title>{this.props.playlistName}</Modal.Title>
        </Modal.Header>

        <Modal.Body>

          {keepWatchingView}
          <hr style={{ backgroundColor: "white" }} ></hr>
          {videos}
        </Modal.Body>
        <Modal.Footer>
          <button className="btn btn-secondary" onClick={evt => this.props.cancelFunction()}>Cancel</button>
        </Modal.Footer>
      </Modal>
    </div>;

    return (
      <div>{body}</div>
    )
  }
}

module.exports = PlaylistPicker;
