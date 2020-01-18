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

  componentWillMount() {
    if (!this.props.authTokenManager.isAuthenticated() && this.props.location.pathname != "/login") {
      this.props.history.push("/login");
    }
  }

  render() {
    var body = this.props.children || <div>
      <Link className="nostyle" to="metadata">Metadata</Link>
    </div>;
    return (
      <div>{body}</div>
    );
  }
}


