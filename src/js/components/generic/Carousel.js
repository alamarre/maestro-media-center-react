import React, { Component, } from "react";

class Carousel extends Component {
  constructor(props) {
    super(props);
    this.state = { current: 0, xOffset: 0, noButtons: "ontouchstart" in document.documentElement, showArrows: false, };
    this.touchEnd = this.touchEnd.bind(this);
    this.touchStart = this.touchStart.bind(this);
    this.touchMove = this.touchMove.bind(this);
    this.startingX = -1;
    this.disableScroll = false;
  }

  goPrevious() {
    let current = this.state.current - 1;
    if(current === -1) {
      current = this.props.children.length -1;
    }
    this.setState({current,});
  }

  goNext() {
    let current = this.state.current + 1;
    if(current === this.props.children.length) {
      current =  0;
    }
    this.setState({current,});
  }

  touchStart(event) {
    const touches = event.changedTouches;
    if(touches.length === 1) {
      this.startingX = touches[0].pageX;
    }
  }

  touchEnd() {
    this.startingX = -1;
  }

  touchMove(event) {
    if(this.disableScroll) {
      return;
    }
    const touches = event.changedTouches;
    if(touches.length === 1) {
      const currentX = touches[0].pageX;
      const offset = currentX- this.startingX;
      if(offset > this.props.itemWidth) {
        this.goPrevious();
      } else if(offset < -(this.props.itemWidth)) {
        this.goNext();
      } else {
        //this.setState({xOffset: offset,});
      }
      
    }
  }

  render() {
    if(!this.props.children) {
      return <div></div>;
    }
    const itemWidth = this.props.itemWidth || 200;
    const maxWidth = this.props.width || (this.refs.root && this.refs.root.clientWidth) || (window.innerWidth - itemWidth);
    const workingWidth = maxWidth;
    
    let leftArrow = <div style={{position: "absolute", top: 0, bottom: 0, backgroundColor: "rgba(128,128,128,0.5)", zIndex: 10,}}>
      <button style={{border: "none", backgroundColor: "transparent", color: "white", padding: 10, display:"table-cell", height: "100%", verticalAlign: "middle",}} onClick={this.goPrevious.bind(this)}><i className="fa fa-arrow-left"></i></button>    
    </div>;
    let rightArrow = <div style={{position: "absolute", top: 0, bottom: 0, right: 0, backgroundColor: "rgba(128,128,128,0.5)", verticalAlign: "middle",}}>
      <button style={{border: "none", backgroundColor: "transparent", color: "white", padding: 10, display:"table-cell", height: "100%", verticalAlign: "middle",}} onClick={this.goNext.bind(this)}><i className="fa fa-arrow-right"></i></button>    
    </div>;
    let horizantalAlignment = "center";
    if (this.state.noButtons || !this.state.showArrows) {
      leftArrow = null;
      rightArrow = null;
    }
    let itemCount = workingWidth <= itemWidth ? 1 : Math.trunc(workingWidth / itemWidth);
    if(itemCount >= this.props.children.length) {
      itemCount = this.props.children.length;
      leftArrow = null;
      rightArrow = null;
      horizantalAlignment = "left";
      this.disableScroll = true;
    } else {
      this.disableScroll = false;
    }
    const children = [];
    const current = this.state.current;
    for(let i=0; i<itemCount; i++) {
      const itemNumber = (current + i) % this.props.children.length;
      children.push(this.props.children[itemNumber]);
    }
    return (
      <div ref="root" onMouseEnter={() => this.setState({showArrows: true,})} onMouseLeave={() => this.setState({showArrows: false,})} onTouchStart={this.touchStart} onTouchEnd={this.touchEnd} onTouchMove={this.touchMove} style={{display: "table", position:"relative", width:"100%",}}>
        {leftArrow}
        <div style={{display: "table-cell", width: "100%", verticalAlign: "middle", paddingLeft: this.state.xOffset, textAlign: horizantalAlignment,}}>
          {children}
        </div>
        {rightArrow}
      </div>
    );
  }
}

module.exports = Carousel;