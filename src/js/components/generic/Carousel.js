import React, { Component } from 'react';

class Carousel extends Component {
    constructor(props) {
        super(props);
        this.state = { current: 0 };
    }

    goPrevious() {
        let current = this.state.current - 1;
        if(current === -1) {
            current = this.props.children.length -1;
        }
        this.setState({current});
    }

    goNext() {
        let current = this.state.current + 1;
        if(current === this.props.children.length) {
            current =  0;
        }
        this.setState({current});
    }

  render() {
      if(!this.props.children) {
          return <div></div>
      }
    const maxWidth = this.props.width || window.innerWidth;
    const itemWidth = this.props.itemWidth || 200;
    const workingWidth = maxWidth - 250;
    const itemCount = workingWidth <= itemWidth ? 1 : Math.trunc(workingWidth / itemWidth);
    const children = [];
    const current = this.state.current;
    for(let i=0; i<itemCount; i++) {
        let itemNumber = (current + i) % this.props.children.length;
        children.push(this.props.children[itemNumber]);
    }
    return (
      <div style={{display: "table", width:"100%"}}>
        <div style={{display: "table-cell", verticalAlign: "middle"}}>
            <button  className="remoteButton" onClick={this.goPrevious.bind(this)}><i className="fa fa-arrow-left fa-3x"></i></button>    
        </div>
        <div style={{display: "table-cell", verticalAlign: "middle", textAlign: "center"}}>
        {children}
        </div>
        <div style={{display: "table-cell", verticalAlign: "middle"}}>
            <button style={{display: "table-cell", verticalAlign: "middle"}}  className="remoteButton" onClick={this.goNext.bind(this)}><i className="fa fa-arrow-right fa-3x"></i></button>  
        </div>
      </div>
    );
  }
}

module.exports = Carousel;