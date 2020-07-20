import React from "react";

import { Link, RouteComponentProps, } from "react-router-dom";
import AuthTokenManager from "../utilities/AuthTokenManager";

export interface HomeProps extends RouteComponentProps {
  authTokenManager: AuthTokenManager;
}
export interface HomeState {

}

export default class Home extends React.Component<HomeProps, HomeState> {

  constructor(props) {
    super(props);
    this.state = {};
  }

  componentDidMount() {
    if (!this.props.authTokenManager.isAuthenticated() && this.props.location.pathname != "/login") {
      this.props.history.push("/login");
    }
  }

  render() {
    var body = this.props.children || <div>
      <div>
        <Link className="nostyle" to="metadata">Approve Metadata</Link>
      </div>
      <div>
        <Link className="nostyle" to="custom-metadata">Customize Metadata</Link>
      </div>
      <div>
        <Link className="nostyle" to="upload">Upload</Link>
      </div>
    </div>;
    return (
      <div>{body}</div>
    );
  }
}


