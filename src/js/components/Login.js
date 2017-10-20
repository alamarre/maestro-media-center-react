import React from 'react'

import { Link } from 'react-router'

class Login extends React.Component {

    constructor(props) {
        super(props);
    }

    login() {
        var self = this;
        this.props.login.loginPromise(this.usernameInput.value, this.passwordInput.value)
        .then((token) => {
            this.props.authTokenManager.setToken(token);
            this.props.router.push("/profile");
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
