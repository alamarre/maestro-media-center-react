import React from 'react'

import { Link } from 'react-router'

import SearchResults from "./SearchResults";

class Home extends React.Component {

    constructor(props) {
        super(props);
        
    }

    componentWillMount() {
        if(!this.props.authTokenManager.isAuthenticated() && this.props.router.location.pathname != "/login") {
            this.props.router.push("/login");
        } else if(!this.props.authTokenManager.isProfileSet() && this.props.router.location.pathname != "/profiles") {
            this.props.router.push("/profiles");
        }
    }
          
    render() {
        var body = this.props.children || <div>
            <SearchResults router={this.props.router} searcher={this.props.searcher} cacheProvider={this.props.cacheProvider} showProgressProvider={this.props.showProgressProvider}  /> 
            <Link to="videos">Videos</Link>
            <Link to="hello">Settings</Link>
        </div>;
        return (
            <div>{body}</div>
        )
    }
}

module.exports = Home
