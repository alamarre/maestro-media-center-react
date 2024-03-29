import React, { ReactInstance, } from "react";
import INavigation from "../utilities/providers/navigation/INavigation";

export type ScrollableProps = {
  navigation: INavigation;
  parentRefs?: () => { [key: string]: ReactInstance };
  refNames?: string[];
  refs?: React.RefObject<HTMLButtonElement | HTMLInputElement | HTMLDivElement>[][];
  isDialog: boolean;
  scrollOnHorizontal?: boolean;
}

export type ScrollableState = {
  selectedIndex: number;
}

export default class Scrollable extends React.Component<ScrollableProps, ScrollableState> {

  private isDialog: boolean;
  public selectedIndex: number;
  horizontalIndex: number;

  constructor(props) {
    super(props);
    this.selectedIndex = 0;
    this.horizontalIndex = 0;
    this.state = { selectedIndex: 0 };
  }

  componentDidMount() {
    if (this.props.isDialog && this.props.navigation) {
      this.props.navigation.focusDialog(this);
    }

    // force a render
    this.setState({ selectedIndex: 0, }, () => {
      this.focusCurrent();
    });

  }

  componentDidUpdate(prevProps) {
    if (this.isDialog && this.props.navigation) {
      this.props.navigation.focusDialog(this);
    }
    if (this.props.refNames != prevProps.refNames) {
      this.focusCurrent();
    }
  }

  focus() {
    this.focusCurrent();
  }

  focusCurrent() {
    if(!this.props.navigation) {
      return;
    }
    if (this.state && this.props.refNames && this.props.refNames.length > 0 && Object.keys(this.props.parentRefs()).length > 0) {
      this.props.parentRefs()[this.props.refNames[this.selectedIndex]]["focus"]();
    }

    if (this.props.refs && this.props.refs.length > 0) {
      this.props.refs[this.selectedIndex][this.horizontalIndex].current.focus();
    }
  }

  componentWillUnmount() {
    if (this.props.isDialog && this.props.navigation && this.props.navigation.unfocusDialog) {
      this.props.navigation.unfocusDialog(this);
    }
  }

  moveLeft() {
    if (this.props.scrollOnHorizontal) {
      this.focusPrevious();
    } else if(this.props.refs[this.selectedIndex].length > 1) {
      //
      this.horizontalIndex--
      if(this.horizontalIndex < 0 ) {
        this.horizontalIndex = this.props.refs[this.selectedIndex].length -1;
      }
      this.focusCurrent();
    }
  }

  moveRight() {
    if (this.props.scrollOnHorizontal) {
      this.focusNext();
    } else if(this.props.refs[this.selectedIndex].length > 1) {
      //
      this.horizontalIndex++;
      if(this.horizontalIndex >= this.props.refs[this.selectedIndex].length) {
        this.horizontalIndex = 0;
      }
      this.focusCurrent();
    }
  }

  selectCurrent() {
    if (this.state && this.props.refNames && this.props.refNames.length > 0 && Object.keys(this.props.parentRefs()).length > 0) {
      if(this.props.parentRefs()[this.props.refNames[this.selectedIndex]]["type"] == "checkbox") {
        return;
      }
      this.props.parentRefs()[this.props.refNames[this.selectedIndex]]["click"]();
    }

    if (this.props.refs && this.props.refs.length > 0) {
      if(this.props.refs[this.selectedIndex][this.horizontalIndex].current["type"] == "checkbox") {
        return;
      }
      this.props.refs[this.selectedIndex][this.horizontalIndex].current.click();
    }
  }

  focusNext() {
    this.selectedIndex++;
    if (this.selectedIndex >= (this.props.refs || this.props.refNames).length) {
      this.selectedIndex = 0;
    }

    if (this.props.refs && this.props.refs.length > 0) {
      if(this.props.refs[this.selectedIndex].length <= this.horizontalIndex) {
        this.horizontalIndex = this.props.refs[this.selectedIndex].length-1;
      }
      this.props.refs[this.selectedIndex][this.horizontalIndex].current.focus();
    } else {
      this.props.parentRefs()[this.props.refNames[this.selectedIndex]]["focus"]();
    }
  }

  focusPrevious() {
    this.selectedIndex--;
    if (this.selectedIndex < 0) {
      this.selectedIndex = (this.props.refs || this.props.refNames).length - 1;
    }

    if (this.props.refs && this.props.refs.length > 0) {
      if(this.props.refs[this.selectedIndex].length <= this.horizontalIndex) {
        this.horizontalIndex = this.props.refs[this.selectedIndex].length-1;
      }
      this.props.refs[this.selectedIndex][this.horizontalIndex].current.focus();
    } else {
      this.props.parentRefs()[this.props.refNames[this.selectedIndex]]["focus"]();
    }
  }

  render() {
    return <div>{this.props.children}</div>
  }

}
