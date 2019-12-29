import React from "react";
import ReactDOM from "react-dom";
import { Link, } from "react-router";
import Scrollable from "../ScrollableComponent";

export default class Menu extends React.Component {

  constructor(props) {
    super(props);
    this.state = { refs: [], };

  }
  componentDidMount() {
    this.setState({ refs: this.props.items.map((item, i) => `item-${i}`), });
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
      return <button key={i} className="maestroButton" style={{ margin: "20px", width: "100%", display: "block", }} ref={ref} onClick={() => item.action()} >{item.name}</button>;
    });
    const body = <div style={menuStyle}>{items}</div>;
    const parentRefs = () => this.refs;

    return <Scrollable isDialog={true} parentRefs={parentRefs} navigation={this.props.navigation} refNames={this.state.refs}>{body}</Scrollable>;


  }
}
