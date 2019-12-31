import React from "react";

import { Link, } from "react-router";
import AuthTokenManager from "../utilities/AuthTokenManager";

export interface HomeProps {
  authTokenManager: AuthTokenManager;
  router: any;
}
export interface HomeState {

}

export default class Home extends React.Component<HomeProps, HomeState> {

  constructor(props) {
    super(props);
    this.state = {};
  }

  componentWillMount() {
    if (!this.props.authTokenManager.isAuthenticated() && this.props.router.location.pathname != "/login") {
      this.props.router.push("/login");
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


