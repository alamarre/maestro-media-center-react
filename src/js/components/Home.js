import React from 'react'

import { Link } from 'react-router'
let EasyInputComponent = require("./EasyInputComponent");

import SearchResults from "./SearchResults";
let SettingsComponent = require("./Settings");

class Home extends EasyInputComponent {

    constructor(props) {
        super(props);
        this.state = {showSettings: false};
    }

    componentWillMount() {
        if(!this.props.authTokenManager.isAuthenticated() && this.props.router.location.pathname != "/login") {
            this.props.router.push("/login");
        } else if(!this.props.authTokenManager.isProfileSet() && this.props.router.location.pathname != "/profiles") {
            this.props.router.push("/profiles");
        }
    }
          
    render() {
        let settingsView = this.state.showSettings ? 
            <SettingsComponent remoteController={this.props.remoteController} settingsManager={this.props.settingsManager}  /> 
            : null;
        var body = this.props.children || <div>
            <button onClick={this.toggleSetting} name="showSettings" />
            {settingsView}
            <SearchResults router={this.props.router} searcher={this.props.searcher} cacheProvider={this.props.cacheProvider} showProgressProvider={this.props.showProgressProvider}  /> 
            <Link to="videos">Videos</Link>
            <Link to="hello">Settings</Link>
        </div>;
        return (
            <div>{body}</div>
        )
    }
}

module.exports = Home
