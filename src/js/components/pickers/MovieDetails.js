import React from 'react'
import { Modal } from 'react-bootstrap';

class MovieDetails extends React.Component {

  constructor(props) {
    super(props);
    this.state = { "movie": null };
    this.loadData();
  }

  async loadData() {
    const movieInfo = await this.props.metadataProvider.getMovieMetadata(this.props.movieName);
    const movieImage = await this.props.metadataProvider.getMoviePoster(this.props.movieName, 150, 225);
    this.setState({ movieInfo, movieImage });
  }

  play() {
    this.props.videoLoader.loadVideo("movie", this.props.movieName, 0);
  }

  render() {
    if (!this.state.movieInfo) {
      return <div></div>;
    }

    const videoView = <div>
        <img src={this.state.movieImage} />
        <button className="maestroButton roundedButton fa fa-play" onClick={evt => this.play()}></button>
        <span>{this.props.movieName} </span>
        <hr />
        <div>{this.state.movieInfo.overview}</div>
      </div>;

    let body = <div>
      <Modal show={true} animation={false} onHide={evt => this.props.cancelFunction()}>
        <Modal.Header>
          <Modal.Title>{this.props.movieName}</Modal.Title>
        </Modal.Header>

        <Modal.Body>

          {videoView}
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

module.exports = MovieDetails;
