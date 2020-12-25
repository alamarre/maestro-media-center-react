import React from "react";
import { Component, } from "react";
import CSS from "csstype";
import {scaleImage} from "../../AppScale";

export interface MetadataImageProps {
  navOrder?: number;
  height: number;
  width: number;
  type: string;
  name: string;
  show?: string;
  season?: string;
  style: CSS.Properties;
  displayNameOnFail?: boolean;
}

export interface MetadataImageState {
  failed: boolean;
}

const imageRoot = process.env.IMAGE_ROOT || "https://maestro-images.omny.ca";
const failedImage = "fallback.png";
export default class MetadataImage extends Component<MetadataImageProps, MetadataImageState> {
  private timer: any;

  constructor(props) {
    super(props);
    this.state = { failed: false, };
  }

  errorHandler() {
    this.setState({ failed: true, });
  }

  componentDidMount() {
    if (!window["accountId"]) {
      this.timer = setInterval(() => {
        if (!window["accountId"]) {
          clearInterval(this.timer);
          this.forceUpdate();
        }
      }, 1000);
    }
  }

  componentWillUnmount() {
    if (this.timer) {
      clearInterval(this.timer);
    }
  }

  render() {
    if (!window["accountId"]) {
      return <div></div>;
    }
    const height = this.props.height;
    const width = this.props.width;
    let type = this.props.type.toLowerCase();
    if (type === "movie") {
      type = "movies";
    }
    if (type === "collection") {
      type = "collections";
    }
    const name = this.props.name;
    const imagePath = type === "episode" ?
      `tv/episode/${this.props.show}/${this.props.season}/${name}` :
      type === "tv" ?
        `tv/show/${name}` :
        `${type}/${name}`;


    if(this.props.displayNameOnFail && this.state.failed) {
      const divStyle = Object.assign({ display: "block", verticalAlign: "top", width, height, textAlign: "center" }, this.props.style);
      return <div style={divStyle}>{name}</div>
    }
    const dimensions = `${width}x${height}`;
    const image = this.state.failed ? `${dimensions}/${failedImage}` : `${window["accountId"]}/${dimensions}/${imagePath}.png`;
    const src = `${imageRoot}/${image}`;

    const style = Object.assign({ display: "block", width: scaleImage(width), height: scaleImage(height), }, this.props.style);
    return <img style={style} src={src} onError={this.errorHandler.bind(this)}></img>;
  }
}

