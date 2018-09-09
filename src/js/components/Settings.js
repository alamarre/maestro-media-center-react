import React from 'react'

import { Link } from 'react-router'
let EasyInputComponent = require("./EasyInputComponent");

class Settings extends EasyInputComponent {

  constructor(props) {
    super(props);
    this.state = {
      remoteControl: this.props.settingsManager.get("remoteControl") == "true",
      remoteClients: [],
      myClientName: this.props.settingsManager.get("myClientName") || "",
      remoteClients: this.props.webSocketSender.getDevices(),
      playToRemoteClient: this.props.settingsManager.get("playToRemoteClient")
    };

    this.handleClientNameChange = this.handleClientNameChange.bind(this);
    this.handleSendToClientNameChange = this.handleSendToClientNameChange.bind(this);
  }

  componentDidMount() {
    document.addEventListener("maestro-remote-client-list-updated", (event) => {
      this.setState({ "remoteClients": event.detail.ids });
    });

    this.setState({
      remoteControl: this.props.settingsManager.get("remoteControl") == "true",
      remoteClients: [],
      myClientName: this.props.settingsManager.get("myClientName") || "",
      remoteClients: this.props.webSocketSender.getDevices(),
      playToRemoteClient: this.props.settingsManager.get("playToRemoteClient")
    });
  }

  handleClientNameChange(event) {
    let value = event.target.value;
    this.handleInputChange(event);

    this.props.remoteController.updateClientName(value);
  }

  handleSendToClientNameChange(event) {
    let value = event.target.value;
    this.handleInputChange(event);

    this.props.webSocketSender.setClient(value);
  }

  switchProfile() {
    this.props.router.push("/profile");
  }

  logout() {
    document.cookie = "";
    this.props.router.push("/login");
  }

  render() {
    let remoteControlSettings = null;
    if (this.state.remoteControl) {
      remoteControlSettings = <div className="form-group">
        <label htmlFor="myClientName">Name to be used when controlling</label>
        <input type="text" className="form-control" name="myClientName" onChange={this.handleClientNameChange} value={this.state.myClientName} />
      </div>
    }

    let remoteControlOtherSettings = null;

    let options = this.state.remoteClients.map((client) => {
      return <option key={client}>{client}</option>;
    });
    if (!this.state.remoteClients.includes(this.state.playToRemoteClient)) {
      options.unshift(<option key={this.state.playToRemoteClient} value={this.state.playToRemoteClient}>{this.state.playToRemoteClient} - Offline</option>);
    }
    let otherOptions = <select className="form-control" value={this.state.playToRemoteClient} name="playToRemoteClient" onChange={this.handleSendToClientNameChange}>
      <option value="">This device</option>
      {options}
    </select>;

    var body = <div>
      <div className="form-check">
        <label className="form-check-label">
          <input type="checkbox" className="form-check-input" name="remoteControl" defaultChecked={this.state.remoteControl} onChange={this.handleInputChange} />
          Allow remote control
                </label>
      </div>
      {remoteControlSettings}
      <div className="form-group">
        <label htmlFor="playToRemoteClient">Play videos on which device</label>
        {otherOptions}
      </div>
      <div className="form-group">
        <button className="btn btn-primary" onClick={this.switchProfile.bind(this)}>Switch Profile</button>
      </div>
      <div className="form-group">
        <button className="btn btn-primary" onClick={this.logout.bind(this)}>Logout</button>
      </div>
    </div>;
    return (
      <div>{body}</div>
    )
  }
}

module.exports = Settings;
