import React from 'react'

import { Link } from 'react-router'
let EasyInputComponent = require("./EasyInputComponent");

import SearchResults from "./SearchResults";
import KeepWatching from "./KeepWatching";
let SettingsComponent = require("./Settings");

class Home extends EasyInputComponent {

    constructor(props) {
        super(props);
        this.state = {showSettings: false, hideSettings: !(window.maestroSettings && window.maestroSettings.NEVER_HIDE_SETTINGS)};
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
        if(window.maestroSettings && window.maestroSettings.NEVER_HIDE_SETTINGS) {
            return;
        }
        this.setState({hideSettings: false});
        if(this.hideSettingsTimeout) {
            window.clearTimeout(this.hideSettingsTimeout);
        }

        this.hideSettingsTimeout = window.setTimeout(() => {
            this.setState({hideSettings: true});
        }, 5000);
    }

    goHome() {
        this.props.router.push("/");
    }
          
    render() {
        let settingsView = this.state.showSettings ? 
            <SettingsComponent router={this.props.router} remoteController={this.props.remoteController} webSocketSender={this.props.webSocketSender}  settingsManager={this.props.settingsManager}  /> 
            : null;
        let settingsDisplay = this.state.hideSettings ? "none" : "block";
        
        let homeButton = null;
        if(["/login", "/profile", "/remote"].includes(this.props.router.location.pathname)) {
            settingsDisplay = "none";
        } else if(!["/"].includes(this.props.router.location.pathname)) {
            homeButton = <button className="maestroButton fa fa-home" onClick={evt => this.goHome()}></button>;
        }
        
        
        let settingsSection = <div style={{display: settingsDisplay}} className="settings">
            <div style={{textAlign: "right", zIndex: 10}}>
                <button class="cast-button" is="google-cast-button"></button>
                {homeButton}
                <button className="maestroButton fa fa-cog" onClick={this.toggleSetting} name="showSettings"></button>
            </div>
           
            {settingsView}
        </div>;

        
    
        let remoteLink = (this.props.settingsManager.get("playToRemoteClient") && this.props.settingsManager.get("playToRemoteClient") !="") ? 
            <Link className="nostyle" to="remote">Remote Control</Link>
            : null;
        var body = this.props.children || <div>
            <div>
                <SearchResults imageRoot={this.props.imageRoot} router={this.props.router} videoLoader={this.props.videoLoader} searcher={this.props.searcher} cacheProvider={this.props.cacheProvider} showProgressProvider={this.props.showProgressProvider}  /> 
            </div>
            <div>
                <KeepWatching imageRoot={this.props.imageRoot} router={this.props.router} videoLoader={this.props.videoLoader} searcher={this.props.searcher} cacheProvider={this.props.cacheProvider} showProgressProvider={this.props.showProgressProvider}  /> 
            </div>
            <div><Link className="nostyle" to="videos">Browse the collection</Link></div>
            <div>{remoteLink}</div>
        </div>;
        return (
            <div>{settingsSection}{body}</div>
        )
    }
}

module.exports = Home
