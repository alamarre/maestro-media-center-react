import React from "react";

import ScrollableComponent from "./ScrollableComponent";

export default class Settings extends ScrollableComponent {

  constructor(props) {
    super(props, ["my-client-name", "play-to-remote-client", "pin", "switch", "logout", "close",], true);

    this.allRefs = ["my-client-name", "play-to-remote-client", "pin", "switch", "logout", "close",];

    this.state = Object.assign({}, this.state, {
      remoteControl: this.props.settingsManager.get("remoteControl") == "true" || this.props.settingsManager.get("remoteControl") === true,
      myClientName: this.props.settingsManager.get("myClientName") || "",
      remoteClients: this.props.webSocketSender.getDevices(),
      playToRemoteClient: this.props.settingsManager.get("playToRemoteClient"),
      lockProfilePin: this.props.settingsManager.get("lockProfilePin"),
    });
    this.handleCheckBoxChange = this.handleCheckBoxChange.bind(this);
    this.handleClientNameChange = this.handleClientNameChange.bind(this);
    this.handleSendToClientNameChange = this.handleSendToClientNameChange.bind(this);
  }

  handleInputChange(event) {
    const target = event.target;
    const value = target.type === "checkbox" ? target.checked : target.value;
    const name = target.name;

    this.setState({ [name]: value, });
    if (this.props.settingsManager) {
      this.props.settingsManager.set(name, value);
    }
  }

  componentDidMount() {
    super.componentDidMount();
    document.addEventListener("maestro-remote-client-list-updated", (event) => {
      this.setState({ "remoteClients": event.detail.ids, });
    });

    this.setState({
      remoteControl: this.props.settingsManager.get("remoteControl") == "true" || this.props.settingsManager.get("remoteControl") === true,
      myClientName: this.props.settingsManager.get("myClientName") || "",
      remoteClients: this.props.webSocketSender.getDevices(),
      playToRemoteClient: this.props.settingsManager.get("playToRemoteClient"),
    });
  }

  handleClientNameChange(event) {
    const value = event.target.value;

    this.handleInputChange(event);
    if (value) {
      this.props.remoteController.updateClientName(value);
    }
  }

  handleSendToClientNameChange(event) {
    const value = event.target.value;

    this.handleInputChange(event);
    this.props.webSocketSender.setClient(value);

  }

  handleCheckBoxChange(event) {
    this.handleInputChange(event);
  }

  switchProfile() {
    const pinNeeded = this.props.settingsManager.get("lockProfilePin");
    if (pinNeeded) {
      const pinEntered = window.prompt("Please enter the pin");
      if (pinEntered != pinNeeded) {
        alert("Wrong pin");
        return;
      }
      this.props.settingsManager.set("lockProfilePin", null);
    }

    this.props.router.push("/profile");
  }

  close() {
    this.props.router.push("/");
  }

  logout() {
    document.cookie = "";
    this.props.router.push("/login");
  }

  togglePin() {
    const pinNeeded = this.props.settingsManager.get("lockProfilePin");
    if (pinNeeded) {
      const pinEntered = window.prompt("Please enter the pin");
      if (pinEntered != pinNeeded) {
        alert("Wrong pin");
        this.setState({ "lockProfilePin": pinNeeded, });
        return;
      }
      this.props.settingsManager.set("lockProfilePin", null);
      this.setState({ "lockProfilePin": null, });
      return;
    }
    const pin = prompt("Set a pin");
    if (!RegExp("^[1-9]{1}[0-9]*$").test(pin)) {
      alert("PIN must be a number");
      return;
    }
    this.props.settingsManager.set("lockProfilePin", pin);
    this.setState({ "lockProfilePin": pin, });
  }

  render() {
    let remoteControlSettings = null;
    remoteControlSettings = <div className="form-group">
      <label htmlFor="myClientName">Name to be used when controlling</label>
      <input ref="my-client-name" type="text" className="form-control" name="myClientName" onBlur={this.handleClientNameChange} defaultValue={this.state.myClientName} />
    </div>;


    const options = this.state.remoteClients.map((client) => {
      return <option key={client}>{client}</option>;
    });
    if (!this.state.remoteClients.includes(this.state.playToRemoteClient)) {
      options.unshift(<option key={this.state.playToRemoteClient} value={this.state.playToRemoteClient}>{this.state.playToRemoteClient} - Offline</option>);
    }
    const otherOptions = <select ref="play-to-remote-client" className="form-control" value={this.state.playToRemoteClient} name="playToRemoteClient" onChange={this.handleSendToClientNameChange}>
      <option value="">This device</option>
      {options}
    </select>;

    var body = <div style={{ backgroundColor: "black", padding: "20px 20px 20px 20px", }}>
      {remoteControlSettings}
      <div className="form-group">
        <label htmlFor="playToRemoteClient">Play videos on which device</label>
        {otherOptions}
      </div>
      <div className="form-group">
        <input ref="pin" type="checkbox" className="form-check-input" name="lockProfilePin" checked={this.state.lockProfilePin > 0} onClick={this.togglePin.bind(this)} />
        Require a pin to change profile
      </div>
      <div className="form-group">
        <button ref="switch" className="btn btn-primary" onClick={this.switchProfile.bind(this)}>Switch Profile</button>
      </div>
      <div className="form-group">
        <button ref="logout" className="btn btn-primary" onClick={this.logout.bind(this)}>Logout</button>
      </div>
      <div className="form-group">
        <button ref="close" className="btn btn-primary" onClick={this.close.bind(this)}>Close</button>
      </div>

    </div>;
    return (
      <div>{body}</div>
    );
  }
}


