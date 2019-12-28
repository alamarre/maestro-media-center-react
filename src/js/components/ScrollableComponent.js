import React from "react";

export default class Scrollable extends React.Component {

  constructor(props, refs, isDialog = true) {
    super(props);
    this.isDialog = isDialog;
    this.selectedIndex = 0;
    this.state = { selectedIndex: 0, refs, };
  }

  componentDidMount() {
    if (this.isDialog) {
      this.props.navigation.focusDialog(this);
    }

    // force a render
    this.setState({ selectedIndex: 0, }, () => {
      this.focusCurrent();
    });

  }

  componentDidUpdate() {
    if (this.isDialog) {
      this.props.navigation.focusDialog(this);
    }
  }

  focus() {
    this.focusCurrent();
  }

  focusCurrent() {
    if (this.state && this.state.refs && this.state.refs.length > 0 && Object.keys(this.refs).length > 0) {
      this.refs[this.state.refs[this.selectedIndex]].focus();
    }
  }

  componentWillUnmount() {
    if (this.isDialog && this.props.navigation && this.props.navigation.unfocusDialog) {
      this.props.navigation.unfocusDialog();
    }
  }

  moveLeft() {
  }

  moveRight() {
  }

  selectCurrent() {
    if (this.state && this.state.refs && this.state.refs.length > 0 && Object.keys(this.refs).length > 0) {
      this.refs[this.state.refs[this.selectedIndex]].click();
    }
  }

  focusNext() {
    this.selectedIndex++;
    if (this.selectedIndex >= this.state.refs.length) {
      this.selectedIndex = 0;
    }

    this.refs[this.state.refs[this.selectedIndex]].focus();
  }

  focusPrevious() {
    this.selectedIndex--;
    if (this.selectedIndex < 0) {
      this.selectedIndex = this.state.refs.length - 1;
    }

    this.refs[this.state.refs[this.selectedIndex]].focus();
  }

}
