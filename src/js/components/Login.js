import React from "react";
import ReactDOM from "react-dom";

import Scrollable from "./ScrollableComponent";

export default class Login extends React.Component {

  constructor(props) {
    super(props);
    this.state = { "error": false, refs: ["username", "password", "login",], };
  }

  login() {
    const usernameInput = ReactDOM.findDOMNode(this.refs.username);
    const passwordInput = ReactDOM.findDOMNode(this.refs.password);
    this.props.login.loginPromise(usernameInput.value, passwordInput.value)
      .then((token) => {
        this.props.authTokenManager.setToken(token);
        if (this.props.postLoginFunction) {
          return this.props.postLoginFunction(this.props.router, token);
        }

        this.props.router.replace("/profile");
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
          <div><input autoCorrect="off" autoCapitalize="none" type="text" style={{ display: "inline-block", width: "50%", }} className="form-control" ref="username" />
          </div>
        </div>
        <div style={{ textAlign: "center", }} className="form-group" >
          <label style={{ textAlign: "left", width: "50%", }}>Password</label>
          <div>
            <input type="text" style={{ display: "inline-block", width: "50%", }} className="form-control" name="password" type="password" ref="password" />
          </div>
        </div>
        <button ref="login" className="btn btn-primary" onClick={this.login.bind(this)}>Login</button>
      </div>
    </div>;

    const parentRefs = () => this.refs;
    return <div><Scrollable isDialog={true} navigation={this.props.navigation} refNames={this.state.refs} parentRefs={parentRefs}>{body}</Scrollable></div >;

  }
}


