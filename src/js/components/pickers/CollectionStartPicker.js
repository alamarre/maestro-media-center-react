import React from "react";
import { Modal, } from "react-bootstrap";

export default class ShowPicker extends React.Component {

  constructor(props) {
    super(props);
    this.state = { "collection": null, };
    this.loadCollectionData();
  }

  async loadCollectionData() {
    const collectionInfo = await this.props.collectionsManager.getCollection(this.props.collectionName);
    const collection = collectionInfo.movies;
    let keepWatchingData = await this.props.showProgressProvider.getShowProgress("collection");
    if (!keepWatchingData || keepWatchingData.season !== this.props.collectionName) {
      keepWatchingData = null;
    }
    this.setState({ collection, keepWatchingData, });
  }

  play(video) {
    const index = this.state.collection.indexOf(video);
    const folder = this.props.collectionName;
    this.props.videoLoader.loadVideo("collection", folder, index);
  }

  render() {
    if (!this.state.collection) {
      return <div></div>;
    }

    const videos = this.state.collection.map(video => {
      return <div key={video}>
        <button className="maestroButton roundedButton fa fa-play" onClick={evt => this.play(video)}></button>
        <span>{video}</span>
      </div>;

    });

    let keepWatchingView = null;
    if (this.state.keepWatchingData) {
      const index = this.state.keepWatchingData.episode;
      const video = this.state.collection[index];
      keepWatchingView = <div>
        <button className="maestroButton roundedButton fa fa-play c" onClick={evt => this.play(video)}></button>
        <span>Keep watching: {video}</span>
      </div>;
    }

    const body = <div>
      <Modal show={true} animation={false} onHide={evt => this.props.cancelFunction()}>
        <Modal.Header>
          <Modal.Title>{this.props.collectionName}</Modal.Title>
        </Modal.Header>

        <Modal.Body>

          {keepWatchingView}
          <hr style={{ backgroundColor: "white", }} ></hr>
          {videos}
        </Modal.Body>
        <Modal.Footer>
          <button className="btn btn-secondary" onClick={evt => this.props.cancelFunction()}>Cancel</button>
        </Modal.Footer>
      </Modal>
    </div>;

    return (
      <div>{body}</div>
    );
  }
}


