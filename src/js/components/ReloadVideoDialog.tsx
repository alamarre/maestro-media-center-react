import React from "react";
import { Modal, } from "react-bootstrap";

import Scrollable from "./ScrollableComponent";
import INavigation from "../utilities/providers/navigation/INavigation";

export interface ReloadProps {
  reload: () => void;
  goHome: () => void;
  navigation: INavigation;
}

export interface ReloadState {
  refs: string[];
}

export default class ReloadVideoDialog extends React.Component<ReloadProps, ReloadState> {
  constructor(props) {
    super(props);
    this.state = Object.assign({ refs: ["reload", "home",], }, this.state);
  }

  render() {
    const body = <div>
      <Modal show={true} animation={false} onHide={() => this.props.goHome()}>
        <Modal.Header>
          <Modal.Title>The video has ended</Modal.Title>
        </Modal.Header>

        <Modal.Body>

          <label>Reload</label>
          <button ref="reload" className="remoteButton" onClick={() => this.props.reload()}><i className="fa fa-refresh fa-3x"></i></button>

          <label>Go Home</label>
          <button ref="home" className="remoteButton" onClick={() => this.props.goHome()}><i className="fa fa-home fa-3x"></i></button>

        </Modal.Body>
        <Modal.Footer>
        </Modal.Footer>
      </Modal>
    </div>;

    const parentRefs = () => this.refs;
    return <div><Scrollable isDialog={true} scrollOnHorizontal={true} navigation={this.props.navigation} refNames={this.state.refs} parentRefs={parentRefs}>{body}</Scrollable></div >;

  }
}


