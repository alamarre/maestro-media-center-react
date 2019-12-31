import React from "react";
import { Component, } from "react";
import INavigation from "../../utilities/providers/navigation/INavigation";
import ReactDOM from "react-dom";

// from https://stackoverflow.com/questions/3944122/detect-left-mouse-button-press
function detectLeftButton(evt) {
  evt = evt || window.event;
  if ("buttons" in evt) {
    return evt.buttons == 1;
  }
  var button = evt.which || evt.button;
  return button == 1;
}

export interface CarouselProps {
  navOrder?: number;
  navigation: INavigation;
  height: number;
  width?: number;
  itemWidth?: number;
  isDragging: (dragging: boolean) => void;
}

export interface CarouselState {
  refs: string[];
  current: number;
  xOffset: number;
  noButtons: boolean;
  showArrows: boolean;
}

export default class Carousel extends Component<CarouselProps, CarouselState> {
  private startingX: number;
  private lastOffset: number;
  private currentOffset: number;
  private disableScroll: boolean;
  private fullWidth: number;
  private dragged: boolean;
  private root: Element;
  constructor(props) {
    super(props);
    this.state = { current: 1, xOffset: 0, noButtons: true, showArrows: false, refs: [], };
    this.moveStart = this.moveStart.bind(this);
    this.moving = this.moving.bind(this);
    this.moveEnd = this.moveEnd.bind(this);
    this.startingX = -1;
    this.lastOffset = 0;
    this.currentOffset = null;
    this.disableScroll = false;
    this.fullWidth = 0;
    this.preventClick = this.preventClick.bind(this);
  }

  preventClick(event) {
    event.preventDefault();
    if (event.stopPropogation) {
      event.stopPropogation();
    }
    event.nativeEvent.stopImmediatePropagation();
  }

  goPrevious() {
    let current = this.state.current - 1;
    if (current === -1) {
      const currentNode = ReactDOM.findDOMNode(this.refs[`child-${this.state.current}`]);
      const rect = currentNode.getBoundingClientRect();
      if (rect.x - 2 * this.props.itemWidth < 0) {
        this.currentOffset += this.props.itemWidth;
      }

      current = React.Children.count(this.props.children) - 1;
      this.currentOffset -= this.fullWidth;
      this.lastOffset = this.currentOffset;

    }
    const currentNode = ReactDOM.findDOMNode(this.refs[`child-${current}`]);
    const rect = currentNode.getBoundingClientRect();

    //console.log(this.currentOffset, this.lastOffset, ReactDOM.findDOMNode(this.refs.scroller).style.transform);
    if (rect.x - 1.1 * this.props.itemWidth < 0) {
      console.log("slide to the left");
      this.lastOffset += this.props.itemWidth;

      this.currentOffset = this.lastOffset;
    }

    //this.normalize();

    this.setState({ current, }, () => {
      ReactDOM.findDOMNode<HTMLButtonElement>(this.refs[`child-${current}`]).focus();
      //console.log("focused", current, this.currentOffset, this.lastOffset, this.refs.scroller.style.transform);
    });
  }

  goNext() {
    const root = ReactDOM.findDOMNode(this.refs.root);
    const maxWidth = this.props.width || (root && root.clientWidth) || (window.innerWidth - this.props.itemWidth);

    let current = this.state.current + 1;
    if (current >= React.Children.count(this.props.children)) {
      const currentNode = ReactDOM.findDOMNode(this.refs[`child-${this.state.current}`]);
      const rect = currentNode.getBoundingClientRect();
      if (rect.x + 2 * this.props.itemWidth >= maxWidth) {
        this.currentOffset -= this.props.itemWidth;
      }

      current = 0;
      this.currentOffset += this.fullWidth;
      this.lastOffset = this.currentOffset;
    }
    //this.props.children[current].focus();
    const currentNode = ReactDOM.findDOMNode(this.refs[`child-${current}`]);
    const rect = currentNode.getBoundingClientRect();
    //console.log(this.currentOffset, this.lastOffset, this.refs.scroller.style.transform);
    if (rect.x + 1.1 * this.props.itemWidth >= maxWidth) {
      this.lastOffset -= this.props.itemWidth;

      this.currentOffset = this.lastOffset;
    }

    //this.normalize();

    this.setState({ current, }, () => {
      ReactDOM.findDOMNode<HTMLButtonElement>(this.refs[`child-${current}`]).focus();
      //console.log("focused", current, this.currentOffset, this.lastOffset, this.refs.scroller.style.transform);
    });
  }

  focus() {
    if (this.state.current >= 0 && this.state.refs.length > 0) {
      //this.props.children[this.state.current].focus();
      //this.state.refs[this.state.current].focus();
      ReactDOM.findDOMNode<HTMLButtonElement>(this.refs[`child-${this.state.current}`]).focus();
      /*setInterval(() => {
        this.set
      }, 200);*/
    }
  }

  moveStart(event) {
    const touches = event.changedTouches;
    if (touches) {
      if (touches.length === 1) {
        this.startingX = touches[0].pageX;
      }
    } else {
      event.preventDefault();
      if (detectLeftButton(event)) {
        //this.preventClick(event);
        this.startingX = event.clientX;
      }
    }
  }

  moving(event) {
    if (this.disableScroll || this.startingX === -1) {
      return;
    }
    let currentX;
    const touches = event.changedTouches;
    if (touches) {
      if (touches.length === 1) {
        currentX = touches[0].pageX;
      } else {
        return;
      }
    } else {
      event.preventDefault();
      //this.preventClick(event);
      currentX = event.clientX;
    }
    const offset = currentX - this.startingX + this.currentOffset;
    this.dragged = true;
    if (this.props.isDragging && !touches) {
      this.props.isDragging(true);
    }
    this.lastOffset = offset;
    console.log(offset);
    const scroller = ReactDOM.findDOMNode<HTMLDivElement>(this.refs.scroller);
    scroller.style.transform = `translate3d(${offset}px, 0px, 0px)`;
  }

  moveEnd() {
    this.startingX = -1;
    this.dragged = false;
    if (this.props.isDragging) {
      setTimeout(() => {
        this.props.isDragging(false);
      }, 1);

    }
    this.normalize();
  }

  normalize() {
    this.currentOffset = this.lastOffset;
    if (this.currentOffset > 0) {
      console.log("subtracting one width", this.fullWidth);
      this.currentOffset -= this.fullWidth;
      this.lastOffset = this.currentOffset;
    }
    else if (this.currentOffset < this.fullWidth * -2) {
      console.log("add one width", this.fullWidth);
      this.currentOffset += this.fullWidth;
      this.lastOffset = this.currentOffset;
    }
  }

  moveLeft() {
    this.goPrevious();
  }

  moveRight() {
    this.goNext();
  }

  componentDidMount() {
    this.props.navigation.registerElementCollection(this, this.props.navOrder);
    this.root = ReactDOM.findDOMNode(this.refs.root);
    this.setState({ refs: React.Children.map(this.props.children, (a, index) => `child-${index}`), });
  }

  componentWillUnmount() {
    //this.props.navigation.remove(this);
  }

  componentDidUpdate(prevProps) {
    if (this.props.children !== prevProps.children) {
      this.setState({ refs: React.Children.map(this.props.children, (a, index) => `child-${index}`), });
    }
    if (this.props.navOrder) {
      this.props.navigation.registerElementCollection(this, this.props.navOrder);
    }
  }

  selectCurrent() {
    const current = this.state.current;
    const currentNode = ReactDOM.findDOMNode(this.refs[`child-${current}`]);
    const child = currentNode.childNodes[0] as HTMLButtonElement;
    child.click();
  }

  render() {
    if (!this.props.children) {
      return <div></div>;
    }

    const itemWidth = this.props.itemWidth || 200;
    const maxWidth = this.props.width || (this.root && this.root.clientWidth) || (window.innerWidth - itemWidth);
    const workingWidth = maxWidth;

    let leftArrow = <div style={{ position: "absolute", top: 0, bottom: 0, backgroundColor: "rgba(128,128,128,0.5)", zIndex: 10, }}>
      <button style={{ border: "none", backgroundColor: "transparent", color: "white", margin: 0, padding: 10, display: "table-cell", height: "100%", verticalAlign: "middle", }} onClick={this.goPrevious.bind(this)}><i className="fa fa-arrow-left"></i></button>
    </div>;
    let rightArrow = <div style={{ position: "absolute", top: 0, bottom: 0, right: 0, backgroundColor: "rgba(128,128,128,0.5)", verticalAlign: "middle", }}>
      <button style={{ border: "none", backgroundColor: "transparent", color: "white", padding: 10, display: "table-cell", height: "100%", verticalAlign: "middle", }} onClick={this.goNext.bind(this)}><i className="fa fa-arrow-right"></i></button>
    </div>;
    if (this.state.noButtons || !this.state.showArrows) {
      leftArrow = null;
      rightArrow = null;
    }
    let itemCount = workingWidth <= itemWidth ? 1 : Math.trunc(workingWidth / itemWidth);
    if (itemCount >= React.Children.count(this.props.children)) {
      itemCount = React.Children.count(this.props.children);
      leftArrow = null;
      rightArrow = null;
      this.disableScroll = true;

      this.currentOffset = null;
    } else {
      this.disableScroll = false;
    }
    const actual = React.Children.map(this.props.children, (a, index) => {
      return <span key={index} ref={this.state.refs[index]} tabIndex={0}>{a}</span>;
    })
    let children = <div>
      <span key="prebuffer">{this.props.children}</span>
      <span key="pre">{this.props.children}</span>
      <span key="actual">{actual}</span>
      <span key="post">{this.props.children}</span>
      <span key="postbuffer">{this.props.children}</span>
    </div>;

    if (this.disableScroll) {
      children = <div>
        <span key="prebuffer">{this.props.children}</span>
        <span key="pre">{this.props.children}</span>
        <span key="actual">{actual}</span>
      </div>;
    }
    if (this.currentOffset == null) {
      this.fullWidth = itemWidth * React.Children.count(this.props.children);
      this.currentOffset = -2 * this.fullWidth;
      this.lastOffset = this.currentOffset;
    }
    return (
      <div ref="root" onMouseEnter={() => this.setState({ showArrows: true, })} onMouseLeave={() => { this.setState({ showArrows: false, }); this.moveEnd(); }} onMouseDown={this.moveStart} onMouseMove={this.moving} onMouseUp={this.moveEnd} onTouchStart={this.moveStart} onTouchEnd={this.moveEnd} onTouchMove={this.moving}
        style={{ position: "relative", width: "100%", height: this.props.height, overflow: "hidden", }}>
        {leftArrow}
        <div ref="scroller"
          style={{ height: this.props.height, transform: `translate3d(${this.lastOffset}px, 0px, 0px)`, width: "30000px", paddingLeft: this.state.xOffset, textAlign: "left", }}>
          {children}
        </div>
        {rightArrow}
      </div>
    );
  }
}
