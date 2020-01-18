import React from "react";
import Scrollable from "./ScrollableComponent";
import ProfileProvider from "../utilities/providers/ProfileProvider";
import CacheProvider from "../utilities/providers/CacheProvider";
import CacheBasedSearch from "../utilities/providers/CacheBasedSearch";
import CacheBasedEpisodeProvider from "../utilities/providers/CacheBasedEpisodeProvider";
import AuthTokenManager from "../utilities/AuthTokenManager";
import INavigation from "../utilities/providers/navigation/INavigation";
import Profile from "../models/Profile";
import { RouteComponentProps, } from "react-router-dom";

export interface ChooseProfileProps extends RouteComponentProps {
  navigation: INavigation;
  profileProvider: ProfileProvider;

  cache: CacheProvider;
  search: CacheBasedSearch;
  serverProvider: CacheBasedEpisodeProvider;
  authTokenManager: AuthTokenManager;
}

export interface ChooseProfileState {
  profiles: Profile[];
  addingProfile: boolean;
  refs: string[];
  newUsername: string;
}
export default class ChooseProfile extends React.Component<ChooseProfileProps, ChooseProfileState> {

  private profileUpdater: any;

  constructor(props) {
    super(props);
    this.state = Object.assign({}, this.state, {
      "addingProfile": false,
      "profiles": null,
      "newUsername": "",
      refs: [],
    });

  }

  async componentDidMount() {
    this.profileUpdater = setInterval(async () => {
      const profiles = await this.props.profileProvider.getProfiles();
      this.setState({ "profiles": profiles, refs: profiles.map((p, i) => `profile-${i}`), });
    }, 1000);
  }

  componentWillUnmount() {
    clearInterval(this.profileUpdater);
  }

  startAddingProfile() {
    this.setState({ "addingProfile": true, });
  }

  createProfile() {
    const username = this.state.newUsername;
    this.props.profileProvider.createProfile(username, false)
      .then(() => {
        this.setProfile(username);
      }, () => { });

  }

  updateCurrentUsername(value) {
    this.setState({ "newUsername": value, });
  }

  cancelCreate() {
    this.setState({ "newUsername": "", "addingProfile": false, });
  }

  setProfile(profile) {
    this.props.authTokenManager.setProfile(profile);
    this.props.cache.reload();
    this.props.search.createIndex();
    this.props.serverProvider.updateServers();
    this.props.history.replace("/");
  }

  render() {
    const addProfileSection = <div>
      <button className="btn btn-primary" onClick={this.startAddingProfile.bind(this)}>Add a new user</button>
    </div>;

    let body = <div>
      <div>Loading Profiles</div>
      {addProfileSection}
    </div>;

    if (this.state.addingProfile) {
      body = <div>
        <label style={{ textAlign: "left", width: "300px", }}>Name</label>
        <div>
          <input style={{ width: "300px", display: "inline-block", }} className="form-control" type="text" onChange={evt => this.updateCurrentUsername(evt.target.value)} />
        </div>
        <div style={{ marginTop: "20px", }}>
          <button style={{ marginRight: "10px", }} className="btn btn-primary" onClick={this.createProfile.bind(this)}>Ok</button>
          <button className="btn btn-secondary" onClick={this.cancelCreate.bind(this)}>Cancel</button>
        </div>
      </div>;
    } else if (this.state.profiles) {
      const profiles = this.state.profiles.map((profile, i) => {
        const ref = `profile-${i}`;
        return <button ref={ref} className="maestroButton fa fa-user fa-3x" style={{ border: "solid 1px white", width: "300px", fontSize: "100px", }} key={profile.profileName} onClick={this.setProfile.bind(this, profile.profileName)}>
          <div style={{ textOverflow: "ellipsis", overflow: "hidden", }}>{profile.profileName}</div>
        </button>;
      });

      let profileSection = <div>{profiles}</div>
      if (this.state.profiles.length == 0) {
        profileSection = <div>No profiles yet.</div>;
      }

      body = <div>
        <div>Who are you?</div>
        {profileSection}
        {addProfileSection}
      </div>;
    }

    const parentRefs = () => this.refs;
    body = <div><Scrollable scrollOnHorizontal={true} isDialog={true} navigation={this.props.navigation} refNames={this.state.refs} parentRefs={parentRefs}>{body}</Scrollable></div >;


    return (
      <div style={{ display: "table", height: "100%", width: "100%", position: "absolute", }}>
        <div style={{ display: "table-cell", height: "50%", width: "50%", verticalAlign: "middle", textAlign: "center", }}>
          {body}
        </div>
      </div>
    );
  }
}


