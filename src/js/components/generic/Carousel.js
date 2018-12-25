import React, { Component, } from "react";

class Carousel extends Component {
  constructor(props) {
    super(props);
    this.state = { current: 0, xOffset: 0, noButtons: "ontouchstart" in document.documentElement, };
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
    const maxWidth = this.props.width || window.innerWidth;
    const itemWidth = this.props.itemWidth || 200;
    let workingWidth = maxWidth - 250;
    
    let leftArrow = <div style={{display: "table-cell", verticalAlign: "middle",}}>
      <button  className="remoteButton" onClick={this.goPrevious.bind(this)}><i className="fa fa-arrow-left fa-3x"></i></button>    
    </div>;
    let rightArrow = <div style={{display: "table-cell", verticalAlign: "middle",}}>
      <button style={{display: "table-cell", verticalAlign: "middle",}}  className="remoteButton" onClick={this.goNext.bind(this)}><i className="fa fa-arrow-right fa-3x"></i></button>  
    </div>;
    let horizantalAlignment = "center";
    if (this.state.noButtons) {
      leftArrow = null;
      rightArrow = null;
      workingWidth = maxWidth;
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
      <div onTouchStart={this.touchStart} onTouchEnd={this.touchEnd} onTouchMove={this.touchMove} style={{display: "table", width:"100%",}}>
        {leftArrow}
        <div style={{display: "table-cell", verticalAlign: "middle", paddingLeft: this.state.xOffset, textAlign: horizantalAlignment,}}>
          {children}
        </div>
        {rightArrow}
      </div>
    );
  }
}

module.exports = Carousel;