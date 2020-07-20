import React from "react";

import { RouteComponentProps, } from "react-router-dom";
import AccountProvider from "../../utilities/providers/AccountProvider";
import theme from "./theme";
import { ThemeProvider } from "@material-ui/core";
import { CssBaseline } from "@material-ui/core";

export interface AppProps extends RouteComponentProps {
  accountProvider: AccountProvider;
}

export default class App extends React.Component<AppProps, {}> {

  constructor(props) {
    super(props);
    this.state = {};
  }

  async componentDidMount() {
    const accountInfo = await this.props.accountProvider.getAccountId();
    window["accountId"] = accountInfo.accountId;
  }

  render() {
    const body = this.props.children;
    return (
      <div>

        <ThemeProvider theme={theme}>
          <CssBaseline  />
          {body}
        </ThemeProvider>
      </div>
    );
  }
}
