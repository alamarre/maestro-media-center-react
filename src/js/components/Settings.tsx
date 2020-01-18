import React from "react";

import Scrollable from "./ScrollableComponent";
import INavigation from "../utilities/providers/navigation/INavigation";
import ISettingsManager from "../utilities/ISettingsManager";
import WebSocketSender from "../utilities/WebSocketSender";
import WebSocketRemoteController from "../utilities/WebSocketRemoteController";
import { RouterProps, } from "react-router";

export interface SettingsProps extends RouterProps {
  navOrder?: number;
  navigation: INavigation;
  settingsManager: ISettingsManager;
  cancelFunction: () => void;
  remoteController: WebSocketRemoteController;
  webSocketSender: WebSocketSender;
}

export interface SettingsState {
  refs: string[];
  remoteControl: boolean;
  myClientName: string;
  remoteClients: string[];
  playToRemoteClient: string;
  lockProfilePin: number;
}

export default class Settings extends React.Component<SettingsProps, SettingsState> {

  constructor(props) {
    super(props, true);
    //this.allRefs = ["my-client-name", "play-to-remote-client", "pin", "switch", "logout", "close",];

    this.state = {
      remoteControl: this.props.settingsManager.get("remoteControl") == "true",
      myClientName: this.props.settingsManager.get("myClientName") || "",
      remoteClients: this.props.webSocketSender.getDevices(),
      playToRemoteClient: this.props.settingsManager.get("playToRemoteClient"),
      lockProfilePin: parseInt(this.props.settingsManager.get("lockProfilePin")),
      refs: ["my-client-name", "play-to-remote-client", "pin", "switch", "logout", "close",],
    };
    this.handleClientNameChange = this.handleClientNameChange.bind(this);
    this.handleSendToClientNameChange = this.handleSendToClientNameChange.bind(this);
  }

  handleInputChange(event) {
    const target = event.target;
    const value = target.type === "checkbox" ? target.checked : target.value;
    const name = target.name;
    if (this.props.settingsManager) {
      this.props.settingsManager.set(name, value);
    }

    return value;
  }

  componentDidMount() {
    document.addEventListener("maestro-remote-client-list-updated", (event: any) => {
      this.setState({ "remoteClients": event.detail.ids, });
    });

    this.setState({
      remoteControl: this.props.settingsManager.get("remoteControl") == "true",
      myClientName: this.props.settingsManager.get("myClientName") || "",
      remoteClients: this.props.webSocketSender.getDevices(),
      playToRemoteClient: this.props.settingsManager.get("playToRemoteClient"),
    });
  }

  handleClientNameChange(event) {
    const value = event.target.value;

    this.handleInputChange(event);

    if (value) {
      this.setState({ myClientName: value, });
      this.props.remoteController.updateClientName(value);
    }
  }

  handleSendToClientNameChange(event) {
    const value = event.target.value;

    this.handleInputChange(event);
    this.setState({ playToRemoteClient: value, });
    this.props.webSocketSender.setClient(value);

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

    this.props.history.push("/profile");
  }

  close() {
    this.props.history.push("/");
  }

  logout() {
    document.cookie = "";
    this.props.history.push("/login");
  }

  togglePin() {
    const pinNeeded = this.props.settingsManager.get("lockProfilePin");
    if (pinNeeded) {
      const pinEntered = window.prompt("Please enter the pin");
      if (pinEntered != pinNeeded) {
        alert("Wrong pin");
        this.setState({ "lockProfilePin": parseInt(pinNeeded), });
        return;
      }
      this.props.settingsManager.set("lockProfilePin", null);
      this.setState({ "lockProfilePin": null, });
      return;
    }
    const pinString = prompt("Set a pin");
    if (!RegExp("^[1-9]{1}[0-9]*$").test(pinString)) {
      alert("PIN must be a number");
      return;
    }
    const pin = parseInt(pinString);
    this.props.settingsManager.set("lockProfilePin", pinString);
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
    const parentRefs = () => this.refs;
    return <div><Scrollable isDialog={true} navigation={this.props.navigation} refNames={this.state.refs} parentRefs={parentRefs}>{body}</Scrollable></div >;

  }
}


