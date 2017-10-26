import React from 'react'

import { Link } from 'react-router'
let EasyInputComponent = require("./EasyInputComponent");

class Settings extends EasyInputComponent {

    constructor(props) {
        super(props);
        this.state = {
            remoteControl: this.props.settingsManager.get("remoteControl") == "true",
            myClientName: this.props.settingsManager.get("myClientName") || ""
        };
    }
   
    render() {
        let remoteControlSettings = null;
        if(this.state.remoteControl) {
            remoteControlSettings = <div>
                <label for="myClientName">Name to be used when controlling</label>
                <input type="text" name="myClientName" onChange={this.handleInputChange} value={this.state.myClientName} />
            </div>
        }
        var body = <div>
            <label>Allow Remote Control</label>
            <input name="remoteControl" checked={this.state.remoteControl} onChange={this.handleInputChange} type="checkbox"  />
            {remoteControlSettings}
        </div>;
        return (
            <div>{body}</div>
        )
    }
}

module.exports = Settings;
