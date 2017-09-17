import React from 'react'

import { Link } from 'react-router'

class Login extends React.Component {

    constructor(props) {
        super(props);
    }

    login() {
        console.log(this.passwordInput);
        var self = this;
        this.props.login.loginPromise(this.usernameInput.value, this.passwordInput.value).then(function(token) {
            self.props.authTokenManager.setToken(token);
            self.props.router.push("/");
        }, function(error) {
            console.log(error);
        })
    }

    render() {
        var body = <div>
            <label>Username:</label><input type="text" ref={(input) => { this.usernameInput = input; }} />
            <label>Password:</label><input type="text" type="password" ref={(input) => { this.passwordInput = input; }} />
            <button onClick={this.login.bind(this)}>Login</button>
        </div>;
        return (
            <div>{body}</div>
        )
    }
}

export default Login;
