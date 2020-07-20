import { createMuiTheme } from "@material-ui/core/styles";
//import red from "@material-ui/core/colors/red";
import lightBlue from "@material-ui/core/colors/lightBlue";

const theme = createMuiTheme({
  palette: {
    type: "dark",
    text: {
      primary: "rgba(255,255,255,1)",
    },
    background: {
      default: "black",
      paper: "black"
    },

    primary: lightBlue
  },
  overrides: {
    MuiPaper: {
      root: {
        backgroundColor: "rgba(0,0,0,1)",
        color: "white"
      }
    }
  },
});

export default theme;

