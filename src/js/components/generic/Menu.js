const React = require("react");
const ReactDOM = require("react-dom");
const { Link, } = require("react-router");
const ScrollableComponent = require("../ScrollableComponent");

class Menu extends ScrollableComponent {

  constructor(props) {
    super(props, [], true);

  }
  componentDidMount() {
    this.setState({ refs: this.props.items.map((item, i) => `item-${i}`) });
    super.componentDidMount();
  }

  componentWillUpdate() {

  }

  render() {

    const menuStyle = {
      position: "absolute",
      left: 100,
      right: 100,
      bottom: 20,
      fontSize: 36,
      color: "white",
      backgroundColor: "black",
      zIndex: 10001,
    };

    const items = this.props.items.map((item, i) => {
      const ref = `item-${i}`;
      return <button key={i} className="maestroButton" style={{ margin: "20px", width: "100%", display: "block" }} ref={ref} onClick={() => item.action()} >{item.name}</button>;
    });
    return <div style={menuStyle}>{items}</div>
  }
}

module.exports = Menu;
