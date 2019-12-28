const React = require("react");
const ReactDOM = require("react-dom");
const { Link, } = require("react-router");

class ClickableButton extends React.Component {

  componentDidMount() {
    const node = ReactDOM.findDOMNode(this.refs.link);
    this.props.navigation.registerElement(node, this.props.navOrder);
  }

  componentDidUpdate() {
    const node = ReactDOM.findDOMNode(this.refs.link);
    if(this.props.navOrder) {
      this.props.navigation.registerElement(node, this.props.navOrder);
    }
  }

  render() {
    return <div><Link ref="link" className="nostyle" to={this.props.to}>{this.props.children}</Link></div>
  }
}

module.exports = ClickableButton;
