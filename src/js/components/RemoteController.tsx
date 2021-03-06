import React from "react";
import INavigation from "../utilities/providers/navigation/INavigation";
import WebSocketSender from "../utilities/WebSocketSender";
import { RouteComponentProps, } from "react-router-dom";
const Slider = require("rc-slider").default;
require("rc-slider/assets/index.css");

export interface RemoteProps extends RouteComponentProps {
  reload: () => void;
  goHome: () => void;
  navigation: INavigation;
  remote: WebSocketSender;

}

export interface RemoteState {
}

export default class RemoteController extends React.Component<RemoteProps, RemoteState> {

  constructor(props) {
    super(props);
  }

  render() {
    var body = <div style={{ display: "table", width: "100%", height: "100%", "position": "absolute", }}>
      <div style={{ display: "table-row", }}>
        <div className="remoteContainer">
          <button className="remoteButton" onClick={this.props.remote.playPrevious.bind(this.props.remote)}><i className="fa fa-step-backward fa-3x"></i></button>
          <button className="remoteButton" onClick={this.props.remote.skipBack.bind(this.props.remote)}><i className="fa fa-backward fa-3x"></i></button>
          <button className="remoteButton" onClick={this.props.remote.play.bind(this.props.remote)}><i className="fa fa-play fa-3x"></i></button>
          <button className="remoteButton" onClick={this.props.remote.pause.bind(this.props.remote)}><i className="fa fa-pause fa-3x"></i></button>
          <button className="remoteButton" onClick={this.props.remote.skipForward.bind(this.props.remote)}><i className="fa fa-forward fa-3x"></i></button>
          <button className="remoteButton" onClick={this.props.remote.playNext.bind(this.props.remote)}><i className="fa fa-step-forward fa-3x"></i></button>

          <Slider style={{ width: "80%", margin: "0 auto", }} min={0} max={100} step={1} onAfterChange={(value) => this.props.remote.seek(value)} ></Slider>
        </div>
      </div>
      <div style={{ display: "table-row", }}>
        <div className="remoteContainer">
          <button className="remoteButton toggleVisibility" onClick={this.props.remote.toggleVisibility.bind(this.props.remote)}><i className="fa fa-adjust fa-3x"></i></button>
          <button className="remoteButton" onClick={this.props.history.push.bind(this.props.history, "/")}><i className="fa fa-home fa-3x"></i></button>
        </div>
      </div>
    </div>;


    return (
      <div>{body}</div>
    );
  }
}


