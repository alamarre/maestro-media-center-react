import React from 'react'

import { Link } from 'react-router'

class Home extends React.Component {

    constructor(props) {
        super(props);   
        this.state = {};
    }

    componentWillMount() {
        document.addEventListener("server-connected", (evt) => {
            this.setState(evt);
        });
    }
          
    render() {
        let info = null;

        if(this.state.ip) {
            info = <div class="server-info">{this.state.clientName} ({this.state.ip})</div>
        }
        var body = this.props.children || <div>
           Cool image background goes here
           {info}
        </div>;
        return (
            <div>{body}</div>
        )
    }
}

module.exports = Home
