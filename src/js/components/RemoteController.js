import React from 'react'

import { Link } from 'react-router'

module.exports = class RemoteController extends React.Component {

    constructor(props) {
        super(props);
    }

    render() {
        var body = <div style ={{display: "table", width: "100%", height: "100%", "position": "absolute"}}>
                <div style={{display: "table-row"}}>
                    <div className="remoteContainer">
                        <button className="remoteButton" onClick={this.props.remote.playPrevious.bind(this.props.remote)}><i className="fa fa-step-backward fa-3x"></i></button>
                        <button className="remoteButton" onClick={this.props.remote.skipBack.bind(this.props.remote)}><i className="fa fa-backward fa-3x"></i></button>
                        <button className="remoteButton" onClick={this.props.remote.play.bind(this.props.remote)}><i className="fa fa-play fa-3x"></i></button>
                        <button className="remoteButton" onClick={this.props.remote.pause.bind(this.props.remote)}><i className="fa fa-pause fa-3x"></i></button>
                        <button className="remoteButton" onClick={this.props.remote.skipForward.bind(this.props.remote)}><i className="fa fa-forward fa-3x"></i></button>
                        <button className="remoteButton" onClick={this.props.remote.playNext.bind(this.props.remote)}><i className="fa fa-step-forward fa-3x"></i></button>
                        
                        <input style={{width: "100%"}} type="range" min="0" max="100" defaultValue="0" step="1" onClick={(event) => this.props.remote.seek(event.target.value)} />
                    </div>
                </div>
                <div style={{display: "table-row"}}>
                    <div className="remoteContainer">
                        <button className="remoteButton toggleVisibility" onClick={this.props.remote.toggleVisibility.bind(this.props.remote)}><i className="fa fa-adjust fa-3x"></i></button>
                        <button className="remoteButton" onClick={this.props.router.push.bind(this.props.router, "/")}><i className="fa fa-home fa-3x"></i></button>
                    </div>
                </div>
            </div>;

        
        return (
            <div>{body}</div>
        )
    }
}