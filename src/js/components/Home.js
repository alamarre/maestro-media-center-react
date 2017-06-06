import React from 'react'

import { Link } from 'react-router'

const Home = React.createClass({
  
  render() {
      var body = this.props.children || <div>
          <Link to="/">Videos</Link>
          <Link to="/">Settings</Link>
      </div>;
    return (
        <div>{body}</div>
    )
  }
})

module.exports = Home