import React, { ReactInstance, } from "react";
import INavigation from "../../utilities/providers/navigation/INavigation";

export type GridProps = {
  navigation: INavigation;
  parentRefs?: () => { [key: string]: ReactInstance };
  refs?: React.RefObject<HTMLButtonElement | HTMLInputElement | HTMLDivElement>[];
  isDialog: boolean;
}

export type GridState = {
  selectedIndex: number;
}

export default class Grid extends React.Component<GridProps, GridState> {

  private isDialog: boolean;
  public selectedIndex: number;

  constructor(props) {
    super(props);
    this.selectedIndex = 0;
    this.state = { selectedIndex: 0, };
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
    if (this.props.refs != prevProps.refs) {
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

    if (this.props.refs && this.props.refs.length > 0) {
      this.props.refs[this.selectedIndex].current.focus();
    }
  }

  componentWillUnmount() {
    if (this.props.isDialog && this.props.navigation && this.props.navigation.unfocusDialog) {
      this.props.navigation.unfocusDialog(this);
    }
  }

  moveLeft() {
    this.selectedIndex--;

    if (this.props.refs && this.props.refs.length > 0) {
      this.props.refs[this.selectedIndex].current.focus();
    }
  }

  moveRight() {
    this.selectedIndex++;

    if (this.props.refs && this.props.refs.length > 0) {
      this.props.refs[this.selectedIndex].current.focus();
    }
  }

  selectCurrent() {
    if (this.props.refs && this.props.refs.length > 0) {
      this.props.refs[this.selectedIndex].current.click();
    }
  }

  // this algorithm only works if all items in a row start at the same height
  findNearestMatch(index: number, seekForward: boolean ) : React.RefObject<HTMLButtonElement | HTMLInputElement | HTMLDivElement> {
    const refs = this.props.refs;
    let candidates : React.RefObject<HTMLButtonElement | HTMLInputElement | HTMLDivElement>[] = [];
    if(seekForward) {
      candidates = refs.slice(index+1);
    } else {
      candidates = refs.slice(0,index-1);
    }

    candidates = candidates.filter(c => seekForward
      ? c.current.getBoundingClientRect().y > refs[index].current.getBoundingClientRect().y
      : c.current.getBoundingClientRect().y < refs[index].current.getBoundingClientRect().y);


    if(candidates.length == 0) {
      candidates = seekForward
        ? refs.slice(0,index-1)
        : refs.slice(index+1);
    }

    if(candidates.length == 0) {
      return refs[index];
    }

    const topOffsets: number[] = candidates.map(c => c.current.getBoundingClientRect().y).filter(t => t!= refs[index].current.getBoundingClientRect().y);

    const rowOffsetHeight = seekForward ? Math.min(...topOffsets) : Math.max(...topOffsets);
    candidates = candidates.filter(c => c.current.getBoundingClientRect().y == rowOffsetHeight);

    const distances : number[] = candidates.map(c => Math.abs(c.current.offsetLeft - refs[index].current.offsetLeft));
    const matchIndex = distances.indexOf(Math.min(...distances));
    return candidates[matchIndex];
  }

  focusNext() {
    const next = this.findNearestMatch(this.selectedIndex, true);
    this.selectedIndex = this.props.refs.indexOf(next);
    this.focusCurrent();
  }

  focusPrevious() {
    const previous = this.findNearestMatch(this.selectedIndex, false);
    this.selectedIndex = this.props.refs.indexOf(previous);
    this.focusCurrent()
  }

  render() {
    return <div>{this.props.children}</div>
  }

}
