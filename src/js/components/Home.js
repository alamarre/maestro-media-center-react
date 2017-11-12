import React from 'react'

import { Link } from 'react-router'
let EasyInputComponent = require("./EasyInputComponent");

import SearchResults from "./SearchResults";
let SettingsComponent = require("./Settings");

class Home extends EasyInputComponent {

    constructor(props) {
        super(props);
        this.state = {showSettings: false, hideSettings: true};
    }

    componentWillMount() {
        if(!this.props.authTokenManager.isAuthenticated() && this.props.router.location.pathname != "/login") {
            this.props.router.push("/login");
        } else if(!this.props.authTokenManager.isProfileSet() && this.props.router.location.pathname != "/profile") {
            this.props.router.push("/profile");
        }

        this.props.videoLoader.setRouter(this.props.router);

        document.addEventListener("maestro-load-video", (event) => {
            event = event.detail;
            //this.props.videoLoader.loadVideo(event.type, event.folder, event.index);
            this.props.router.push(`/view?type=${event.type}&index=${event.index}&folder=${event.folder}`);
        });

        document.addEventListener("mousemove", this.showSettingsTemporarily.bind(this));
        document.body.addEventListener('click', this.showSettingsTemporarily.bind(this), true); 
    }

    showSettingsTemporarily() {
        this.setState({hideSettings: false});
        if(this.hideSettingsTimeout) {
            window.clearTimeout(this.hideSettingsTimeout);
        }

        this.hideSettingsTimeout = window.setTimeout(() => {
            this.setState({hideSettings: true});
        }, 5000);
    }
          
    render() {
        let settingsView = this.state.showSettings ? 
            <SettingsComponent remoteController={this.props.remoteController} webSocketSender={this.props.webSocketSender}  settingsManager={this.props.settingsManager}  /> 
            : null;
        let settingsSection = this.state.hideSettings ? null : <div className="settings">
            <div style={{textAlign: "right"}}>
                <button class="cast-button" is="google-cast-button"></button>
                <button className="maestroButton fa fa-cog" onClick={this.toggleSetting} name="showSettings"></button>
            </div>
           
            {settingsView}
        </div>;

        if(["/login", "/profile", "/remote"].includes(this.props.router.location.pathname)) {
            settingsSection = null;
        }
    
        let remoteLink = (this.props.settingsManager.get("playToRemoteClient") && this.props.settingsManager.get("playToRemoteClient") !="") ? 
            <Link className="nostyle" to="remote">Remote Control</Link>
            : null;
        var body = this.props.children || <div>
            <div>
                <SearchResults router={this.props.router} videoLoader={this.props.videoLoader} searcher={this.props.searcher} cacheProvider={this.props.cacheProvider} showProgressProvider={this.props.showProgressProvider}  /> 
            </div>
            <Link className="nostyle" to="videos">Browse the collection</Link>
            {remoteLink}
        </div>;
        return (
            <div>{settingsSection}{body}</div>
        )
    }
}

module.exports = Home
