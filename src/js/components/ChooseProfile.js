const React = require("react");
const ScrollableComponent = require("./ScrollableComponent");

class ChooseProfile extends ScrollableComponent {

  constructor(props) {
    super(props, [], true);
    this.state = Object.assign({}, this.state, {
      "addingProfile": false,
      "profiles": null,
      "newUsername": "",
    });

  }

  componentWillMount() {
    setInterval(() => {
      this.props.profileProvider.getProfiles()
        .then((profiles) => {
          this.setState({ "profiles": profiles, refs: profiles.map((p, i) => `profile-${i}`) }, this.focusCurrent());
        }, (err) => {
          throw err;
        });
    }, 1000);

  }

  startAddingProfile() {
    this.setState({ "addingProfile": true, });
  }

  createProfile() {
    const username = this.state.newUsername;
    this.props.profileProvider.createProfile(username, false)
      .then(() => {
        this.setProfile(username);
      },
        () => { });

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
    this.props.router.replace("/");
  }

  moveLeft() {
    this.focusPrevious();
  }

  moveRight() {
    this.focusNext();
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
      let profiles = this.state.profiles.map((profile, i) => {
        const ref = `profile-${i}`;
        return <button ref={ref} className="maestroButton fa fa-user fa-3x" style={{ border: "solid 1px white", width: "300px", fontSize: "100px", }} key={profile.profileName} onClick={this.setProfile.bind(this, profile.profileName)}>
          <div style={{ textOverflow: "ellipsis", overflow: "hidden", }}>{profile.profileName}</div>
        </button>;
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
      <div style={{ display: "table", height: "100%", width: "100%", position: "absolute", }}>
        <div style={{ display: "table-cell", height: "50%", width: "50%", verticalAlign: "middle", textAlign: "center", }}>
          {body}
        </div>
      </div>
    );
  }
}

module.exports = ChooseProfile;
