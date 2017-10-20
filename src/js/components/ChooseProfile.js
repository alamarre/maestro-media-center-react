import React from 'react'

import { Link } from 'react-router'

class ChooseProfile extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            "addingProfile": false,
            "profiles": null,
            "newUsername": ""
        };

        props.profileProvider.getProfiles()
        .then((profiles) => {
            this.setState({"profiles": profiles})
        }, (err) => {
            throw err;
        });
    }

    startAddingProfile() {
        this.setState({"addingProfile": true});
    }

    createProfile() {
        let username = this.state.newUsername;
        this.props.profileProvider.createProfile(username, false)
        .then(() => {
            this.setProfile(username);
        },
        () => {});
        
    }

    updateCurrentUsername(value) {
        this.setState({"newUsername": value});
    }

    cancelCreate() {
        this.setState({"newUsername": "", "addingProfile": false});
    }

    setProfile(profile) {
        this.props.authTokenManager.setProfile(profile);
        this.props.router.push("/");
    }

    render() {
        let addProfileSection = <div>
                <button onClick={this.startAddingProfile.bind(this)}>Add a new user</button>
            </div> 

        let body = <div>
            <div>Loading Profiles</div>
            {addProfileSection}
        </div>;

        if(this.state.addingProfile) {
            body = <div>
                <label>Name</label>
                <input type="text" onChange={evt => this.updateCurrentUsername(evt.target.value)} />
                <button onClick={this.createProfile.bind(this)}>Ok</button>
                <button onClick={this.cancelCreate.bind(this)}>Cancel</button>
            </div>;
        } else if (this.state.profiles) {
            let profiles = this.state.profiles.map((profile) => {
                return <button key={profile.profileName} onClick={this.setProfile.bind(this,profile.profileName)}>{profile.profileName}</button>;
            });

            if (this.state.profiles.length == 0) {
                profiles = <div>No profiles yet.</div>;
            } 

            body = <div>
                <div>Who are you?</div>
                    {profiles}
                    {addProfileSection}
                </div>;
        }

        
        return (
            <div>{body}</div>
        )
    }
}

export default ChooseProfile;
