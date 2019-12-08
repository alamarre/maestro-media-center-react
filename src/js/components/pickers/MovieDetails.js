const React = require("react");
const { Modal, } = require("react-bootstrap");
const ScrollableComponent = require("../ScrollableComponent");

const MetadataImage = require("../generic/MetadataImage");

class MovieDetails extends ScrollableComponent {

  constructor(props) {
    super(props, ["playbutton", "cancel"]);
    this.state = Object.assign(this.state, { "movie": null, playBackgroundColor: "#FF0" });
    this.loadData();
  }

  async loadData() {
    const movieInfo = await this.props.metadataProvider.getMovieMetadata(this.props.movieName);
    this.setState({ movieInfo, }, () => {
      this.focusCurrent();
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

    return (
      <div>{body}</div>
    );
  }
}

module.exports = MovieDetails;
