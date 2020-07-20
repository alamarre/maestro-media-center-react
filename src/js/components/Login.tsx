import React from "react";

import Scrollable from "./ScrollableComponent";
import LoginProvider from "../utilities/LoginProvider";
import INavigation from "../utilities/providers/navigation/INavigation";
import AuthTokenManager from "../utilities/AuthTokenManager";
import { RouteComponentProps, } from "react-router-dom";

export interface LoginProps extends RouteComponentProps {
  navigation: INavigation;
  login: LoginProvider;

  authTokenManager: AuthTokenManager;
  postLoginFunction: (history: any, token: string) => void;
}

export interface LoginState {
  refs: string[];
  error: boolean;
}


export default class LoginComponent extends React.Component<LoginProps, LoginState> {

  private userNameRef = React.createRef<HTMLInputElement>();
  private passwordRef = React.createRef<HTMLInputElement>();
  private loginButtonRef = React.createRef<HTMLButtonElement>();
  constructor(props) {
    super(props);
    this.state = { "error": false, refs: ["username", "password", "login",], };
  }

  login() {
    const usernameInput = this.userNameRef;
    const passwordInput = this.passwordRef;
    this.props.login.loginPromise(usernameInput.current.value, passwordInput.current.value)
      .then((token) => {
        this.props.authTokenManager.setToken(token);
        if (this.props.postLoginFunction) {
          return this.props.postLoginFunction(this.props.history, token);
        }

        this.props.history.replace("/profile");
      }, (error) => {
        console.log(error);
        this.setState({ error: true, });
      });
  }

  render() {
    const errorMessage = this.state.error ? <div style={{ width: "50%", display: "inline-block", }} className="alert alert-danger" role="alert">
      <strong>Error:</strong> Username or password are incorrect
    </div> : null;
    var body = <div style={{ display: "table", height: "100%", width: "100%", position: "absolute", }}>
      <div style={{ display: "table-cell", height: "50%", width: "50%", verticalAlign: "middle", textAlign: "center", }}>
        <h1>Maestro Media Center</h1>
        <h2>Please Login</h2>
        {errorMessage}
        <div style={{ textAlign: "center", }} className="form-group">
          <label style={{ textAlign: "left", width: "50%", }}>Username</label>
          <div><input autoCorrect="off" autoCapitalize="none" type="text" style={{ display: "inline-block", width: "50%", }} className="form-control" ref={this.userNameRef} />
          </div>
        </div>
        <div style={{ textAlign: "center", }} className="form-group" >
          <label style={{ textAlign: "left", width: "50%", }}>Password</label>
          <div>
            <input type="password" style={{ display: "inline-block", width: "50%", }} className="form-control" name="password" ref={this.passwordRef} />
          </div>
        </div>
        <button ref={this.loginButtonRef} className="btn btn-primary" onClick={this.login.bind(this)}>Login</button>
      </div>
    </div>;

    return <div><Scrollable isDialog={true} navigation={this.props.navigation} refs={[[this.userNameRef], [this.passwordRef], [this.loginButtonRef]]}>{body}</Scrollable></div >;

  }
}


