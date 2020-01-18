import React from "react";
import { Modal, } from "react-bootstrap";

import MetadataImage from "../generic/MetadataImage";
import INavigation from "../../utilities/providers/navigation/INavigation";
import Scrollable from "../ScrollableComponent";
import MovieMetadata from "../../models/MovieMetadata";

export interface MoviePickerProps {
  navOrder?: number;
  navigation: INavigation;
  showProgressProvider: any;
  videoLoader: any;
  cancelFunction: () => void;
  movieName: string;
  metadataProvider: any;
  episodeLoader: any;
}

export interface MoviePickerState {
  refs: string[];
  movieInfo: MovieMetadata;
}

export default class MovieDetails extends React.Component<MoviePickerProps, MoviePickerState> {

  constructor(props) {
    super(props);
    this.state = { movieInfo: null, refs: ["playbutton", "cancel",], };
    this.loadData();
  }

  async loadData() {
    const movieInfo = await this.props.metadataProvider.getMovieMetadata(this.props.movieName);
    this.setState({ movieInfo, }, () => {
      //this.focusCurrent();
    });
  }

  play() {
    this.props.videoLoader.loadVideo("movie", this.props.movieName, 0);
  }

  render() {
    if (!this.state.movieInfo) {
      return <div></div>;
    }

    const videoView = <div style={{ display: "table", }}>
      <MetadataImage style={{ display: "inline", }} type="movies" width={150} height={225} name={this.props.movieName} ></MetadataImage>
      <div style={{ display: "table-cell", verticalAlign: "top", }}>
        <button ref="playbutton" className="maestroButton roundedButton fa fa-play" onClick={() => this.play()}></button>
        <span>{this.props.movieName} </span>
        <hr />
        <div style={{ marginLeft: "20", }}>{this.state.movieInfo.overview}</div>
      </div>
    </div>;

    const body = <div>
      <Modal show={true} animation={false} onHide={() => this.props.cancelFunction()}>
        <Modal.Header>
          <Modal.Title>{this.props.movieName}</Modal.Title>
        </Modal.Header>

        <Modal.Body>

          {videoView}
        </Modal.Body>
        <Modal.Footer>
          <button ref="cancel" className="btn btn-secondary" onClick={() => this.props.cancelFunction()}>Cancel</button>
        </Modal.Footer>
      </Modal>
    </div>;
    const parentRefs = () => this.refs;
    return <div><Scrollable isDialog={true} parentRefs={parentRefs} navigation={this.props.navigation} refNames={this.state.refs}>{body}</Scrollable></div>

  }
}


