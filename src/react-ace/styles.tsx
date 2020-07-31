import makeStyles from "@material-ui/core/styles/makeStyles"

import blue from "@material-ui/core/colors/blue"
import grey from "@material-ui/core/colors/grey"

export default makeStyles(theme => ({
  "@global": {
    ".ace_gutter": {
      background: "none !important",
    },
    ".ace_gutter-cell": {
      width: "100%",
      paddingLeft: "0!important",
      paddingRight: `${theme.spacing(1)}px !important`,
      fontSize: "0.8em",
    },
    ".ace_gutter-cell.ace_info": {
      backgroundImage: "none !important",
      backgroundColor: theme.palette.type == "light" ? blue[100] : blue[900],
    },
    ".ace_display_only .ace_cursor-layer": {
      display: "none",
    },
    ".ace_display_only .ace_bracket": {
      display: "none",
    },
    ".ace_display_only .ace_indent-guide": {
      background: "none",
    },
    ".ace_mobile-menu": {
      display: "none !important",
    },
    ".ace_fold-widget": {
      display: "none !important",
    },
  },
  top: {
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(2),
  },
  wrapper: {
    backgroundColor: theme.palette.action.hover,
    paddingTop: theme.spacing(2),
    paddingBottom: theme.spacing(2),
    position: "relative",
  },
  skeleton: {
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(2),
  },
  editor: {
    fontFamily: "Source Code Pro, monospace!important",
    backgroundColor: `rgba(0,0,0,0)!important`,
    background: "none!important",
    lineHeight: "1.4em!important",
  },
  overlaysWrapperTop: {
    zIndex: 10,
    position: "absolute",
    top: 2,
    right: 2,
    display: "flex",
  },
  overlaysWrapperBottom: {
    zIndex: 10,
    position: "absolute",
    bottom: 2,
    right: 2,
    display: "flex",
  },
  close: {
    fontSize: theme.spacing(2.4),
    position: "absolute",
    top: 0,
    right: 0,
    zIndex: 20,
    color: "white",
  },
  output: {
    margin: 0,
    padding: theme.spacing(1),
    color: grey[50],
    backgroundColor: grey.A700,
    border: "none",
    overflow: "auto",
  },
  outputPre: {
    fontFamily: "Source Code Pro, monospace!important",
    margin: 0,
  },
  terminalSkeleton: {
    position: "absolute",
    zIndex: 10,
    color: "white",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    backgroundColor: "rgba(255, 255, 255, 0.5)",
  },
}))

export const buttonStyles = makeStyles({
  iconWrapper: {
    lineHeight: 1,
    padding: 0,
  },
  tooltipPosition: {
    margin: 0,
  },
})
