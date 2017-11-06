import React from 'react'

import { Link } from 'react-router'

class Login extends React.Component {

    constructor(props) {
        super(props);
        this.state = {"error": false};
    }

    login() {
        var self = this;
        this.props.login.loginPromise(this.usernameInput.value, this.passwordInput.value)
        .then((token) => {
            
            this.props.authTokenManager.setToken(token);
            this.props.router.push("/profile");
        }, (error) => {
            console.log(error);
            this.setState({error: true});
        })
    }

    render() {
        let errorMessage = this.state.error ? <div style={{width: "50%", display: "inline-block"}} className="alert alert-danger" role="alert">
    <strong>Error:</strong> Username or password are incorrect
    </div> : null;
        var body = <div style={{display: "table", height: "100%", width: "100%", position: "absolute"}}>
            <div style={{display: "table-cell", height: "50%", width: "50%", verticalAlign: "middle", textAlign: "center"}}>
                    <h1>Maestro Media Center</h1>
                    <h2>Please Login</h2>
                    {errorMessage}
                    <div style={{textAlign: "center"}} className="form-group">
                        <label style={{textAlign: "left", width: "50%"}}>Username</label>
                        <div><input type="text" style={{display:"inline-block", width: "50%"}} className="form-control" ref={(input) => { this.usernameInput = input; }} />
                        </div>
                    </div>
                    <div style={{textAlign: "center"}} className="form-group" >
                        <label style={{textAlign: "left", width: "50%"}}>Password</label>
                        <div>
                        <input type="text" style={{display:"inline-block", width: "50%"}} className="form-control" name="password" type="password" ref={(input) => { this.passwordInput = input; }} />
                        </div>
                    </div>
                    <button className="btn btn-primary" onClick={this.login.bind(this)}>Login</button>
            </div>
        </div>;

        
        return (
            <div>{body}</div>
        )
    }
}

export default Login;
