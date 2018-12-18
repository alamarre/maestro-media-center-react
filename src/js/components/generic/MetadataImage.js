import React,{ Component, } from "react";

const imageRoot = process.env.IMAGE_ROOT || "https://video-images.omny.ca";
const failedImage = "placeholder.png";
class MetadataImage extends Component {
  constructor(props) {
    super(props);
    this.state={failed: false,};
  }

  errorHandler() {
    this.setState({failed: true,});
  }

  render() {
    const height = this.props.height;
    const width = this.props.width;
    let type = this.props.type.toLowerCase();
    if(type === "movie") {
      type = "movies";
    }
    if(type === "collection") {
      type = "collections";
    }
    const name = this.props.name;
    const imagePath = type === "episode" ?
      `tv/episode/${this.props.show}/${this.props.season}/${name}` :
      type === "tv" ?
        `tv/show/${name}` :
        `${type}/${name}`;
    const image = this.state.failed ? failedImage : `${imagePath}.jpg`;
    const src = `${imageRoot}/${width}x${height}/${image}`;
    const style = Object.assign({display: "block",}, this.props.style);
    return <img style={style} src={src} onError={this.errorHandler.bind(this)}></img>;
  }
}

module.exports = MetadataImage;