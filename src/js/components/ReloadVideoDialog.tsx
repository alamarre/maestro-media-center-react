import React from "react";
import { Button, Dialog, DialogActions, DialogTitle, DialogContent } from "@material-ui/core";

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

  private reloadRef : React.RefObject<HTMLButtonElement> = React.createRef<HTMLButtonElement>();
  private goHomeRef : React.RefObject<HTMLButtonElement> = React.createRef<HTMLButtonElement>();
  constructor(props) {
    super(props);
    this.state = Object.assign({ refs: ["reload", "home",], }, this.state);
  }

  render() {
    const body = <div>
      <Dialog open={true} fullScreen={true}>

        <DialogTitle>
          The video has ended
        </DialogTitle>

        <DialogContent>
          <label>Reload</label>
          <button ref={this.reloadRef} className="remoteButton" onClick={() => this.props.reload()}><i className="fa fa-sync fa-3x"></i></button>

          <label>Go Home</label>
          <button ref={this.goHomeRef} className="remoteButton" onClick={() => this.props.goHome()}><i className="fa fa-home fa-3x"></i></button>

        </DialogContent>
      </Dialog>
    </div>;

    const parentRefs = () => this.refs;
    return <div><Scrollable isDialog={true} scrollOnHorizontal={true} navigation={this.props.navigation} refs={[[this.reloadRef],[this.goHomeRef]]}>{body}</Scrollable></div >;

  }
}


