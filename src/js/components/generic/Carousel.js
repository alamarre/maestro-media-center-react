const React = require("react");
const { Component, } = require("react");

// from https://stackoverflow.com/questions/3944122/detect-left-mouse-button-press
function detectLeftButton(evt) {
  evt = evt || window.event;
  if ("buttons" in evt) {
    return evt.buttons == 1;
  }
  var button = evt.which || evt.button;
  return button == 1;
}

class Carousel extends Component {
  constructor(props) {
    super(props);
    this.state = { current: 0, xOffset: 0, noButtons: true, showArrows: false, };
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
    if(event.stopPropogation) {
      event.stopPropogation();
    }
    event.nativeEvent.stopImmediatePropagation();
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

  moveStart(event) {
    const touches = event.changedTouches;
    if(touches) {
      if(touches.length === 1) {
        this.startingX = touches[0].pageX;
      }
    } else {
      event.preventDefault();
      if(detectLeftButton(event)) {
        //this.preventClick(event);
        this.startingX = event.clientX;
      }
    }
  }

  moving(event) {
    if(this.disableScroll || this.startingX === -1) {
      return;
    }
    let currentX;
    const touches = event.changedTouches;
    if(touches) {
      if(touches.length === 1) {
        currentX = touches[0].pageX;
      } else {
        return;
      }
    } else {
      event.preventDefault();
      //this.preventClick(event);
      currentX = event.clientX;
    }
    const offset = currentX- this.startingX + this.currentOffset;
    this.dragged = true;
    if(this.props.isDragging && !touches) {
      this.props.isDragging(true);
    }
    this.lastOffset = offset;
    console.log(offset);
    this.refs.scroller.style.transform = `translate3d(${offset}px, 0px, 0px)`;
  }

  moveEnd() {
    this.startingX = -1;
    this.dragged = false;
    if(this.props.isDragging) {
      setTimeout(() => {
        this.props.isDragging(false);
      }, 1);
      
    }
    this.currentOffset = this.lastOffset;
    if(this.currentOffset > 0) {
      this.currentOffset -= this.fullWidth;
      this.lastOffset = this.currentOffset;
    }
    else if (this.currentOffset < this.fullWidth * -2) {
      this.currentOffset += this.fullWidth;
      this.lastOffset = this.currentOffset;
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
      <button style={{border: "none", backgroundColor: "transparent", color: "white", margin: 0, padding: 10, display:"table-cell", height: "100%", verticalAlign: "middle",}} onClick={this.goPrevious.bind(this)}><i className="fa fa-arrow-left"></i></button>    
    </div>;
    let rightArrow = <div style={{position: "absolute", top: 0, bottom: 0, right: 0, backgroundColor: "rgba(128,128,128,0.5)", verticalAlign: "middle",}}>
      <button style={{border: "none", backgroundColor: "transparent", color: "white", padding: 10, display:"table-cell", height: "100%", verticalAlign: "middle",}} onClick={this.goNext.bind(this)}><i className="fa fa-arrow-right"></i></button>    
    </div>;
    if (this.state.noButtons || !this.state.showArrows) {
      leftArrow = null;
      rightArrow = null;
    }
    let itemCount = workingWidth <= itemWidth ? 1 : Math.trunc(workingWidth / itemWidth);
    if(itemCount >= this.props.children.length) {
      itemCount = this.props.children.length;
      leftArrow = null;
      rightArrow = null;
      this.disableScroll = true;
    } else {
      this.disableScroll = false;
    }

    const children = <div>
      <span key="prebuffer">{this.props.children}</span>
      <span key="pre">{this.props.children}</span>
      <span key="actual">{this.props.children}</span>
      <span key="post">{this.props.children}</span>
      <span key="postbuffer">{this.props.children}</span>
    </div>;
    if(this.currentOffset == null) {
      this.fullWidth = itemWidth * this.props.children.length;
      this.currentOffset = -2* this.fullWidth;
      this.lastOffset = this.currentOffset;
      
    }
    return (
      <div ref="root" onMouseEnter={() => this.setState({showArrows: true,})} onMouseLeave={(event) => {this.setState({showArrows: false,}); this.moveEnd(event);}} onMouseDown={this.moveStart} onMouseMove={this.moving} onMouseUp={this.moveEnd} onTouchStart={this.moveStart} onTouchEnd={this.moveEnd} onTouchMove={this.moving} 
        style={{ position:"relative", width: "100%", height: this.props.height, overflow: "hidden", }}>
        {leftArrow}
        <div ref="scroller" 
          style={{ height: this.props.height, transform: `translate3d(${this.lastOffset}px, 0px, 0px)`, width: "30000px", paddingLeft: this.state.xOffset, textAlign: "left",}}>
          {children}
        </div>
        {rightArrow}
      </div>
    );
  }
}

module.exports = Carousel;