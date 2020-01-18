import React from "react";
import { Link, } from "react-router-dom";
import INavigation from "../../utilities/providers/navigation/INavigation";

export interface ClickableButtonProps {
  navOrder?: number;
  navigation: INavigation;
  to: string;
}

export interface ClickableButtonState {
  refs: string[];
}

export default class ClickableButton extends React.Component<ClickableButtonProps, ClickableButtonState> {
  private ref = React.createRef<Link>();

  constructor(props) {
    super(props);
  }
  componentDidMount() {

    this.props.navigation.registerElement(this.ref.current, this.props.navOrder);
  }

  componentDidUpdate() {
    if (this.props.navOrder) {
      this.props.navigation.registerElement(this.ref.current, this.props.navOrder);
    }
  }

  render() {
    return <div><Link ref={this.ref} className="nostyle" to={this.props.to}>{this.props.children}</Link></div>
  }
}


