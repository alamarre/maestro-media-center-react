import React from "react";

import { RouteComponentProps, } from "react-router-dom";

export interface AppProps extends RouteComponentProps {
}

export default class App extends React.Component<AppProps, {}> {

  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
    const body = this.props.children;
    return (
      <div>{body}</div>
    );
  }
}
