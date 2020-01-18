import React from "react";
import Scrollable from "../ScrollableComponent";
import INavigation from "../../utilities/providers/navigation/INavigation";

export interface MenuProps {
  navOrder?: number;
  navigation: INavigation;
  items: ActionItem[];
}

export interface MenuState {
  refs: string[];
}

export interface ActionItem {
  name: string;
  action: () => void;
}

export default class Menu extends React.Component<MenuProps, MenuState> {

  constructor(props) {
    super(props);
    this.state = { refs: [], };

  }
  componentDidMount() {
    this.setState({ refs: this.props.items.map((item, i) => `item-${i}`), });
  }

  componentWillUpdate() {

  }

  render() {

    const items = this.props.items.map((item, i) => {
      const ref = `item-${i}`;
      return <button key={i} className="maestroButton" style={{ margin: "20px", width: "100%", display: "block", }} ref={ref} onClick={() => item.action()} >{item.name}</button>;
    });
    const body = <div style={{
      position: "absolute",
      left: "100",
      right: "100",
      bottom: "20",
      fontSize: "36",
      color: "white",
      backgroundColor: "black",
      zIndex: 10001,
    }}>{items}</div>;
    const parentRefs = () => this.refs;

    return <Scrollable isDialog={true} parentRefs={parentRefs} navigation={this.props.navigation} refNames={this.state.refs}>{body}</Scrollable>;


  }
}
