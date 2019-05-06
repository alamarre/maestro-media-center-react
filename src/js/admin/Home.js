const React = require("react");

const { Link, } = require("react-router");

class Home extends React.Component {

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

module.exports = Home;
