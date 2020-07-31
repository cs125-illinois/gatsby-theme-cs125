import React from "react"
import PropTypes from "prop-types"

import useTheme from "@material-ui/core/styles/useTheme"
import makeStyles from "@material-ui/core/styles/makeStyles"

import Tooltip from "@material-ui/core/Tooltip"
import IconButton from "@material-ui/core/IconButton"
import PlayCircleFilled from "@material-ui/icons/PlayCircleFilled"
import CircularProgress from "@material-ui/core/CircularProgress"
import green from "@material-ui/core/colors/green"
import { buttonStyles } from "./styles"

const useStyles = makeStyles(theme => ({
  run: {
    color: green[700],
    fontSize: theme.spacing(4),
  },
  running: {
    position: "absolute",
    bottom: 0,
    left: 0,
    color: green.A400,
  },
}))

export const RunButton: React.FC<{ running: boolean; run: () => void }> = ({ running, run }) => {
  const theme = useTheme()
  const classes = useStyles()
  const buttonClasses = buttonStyles()
  return (
    <Tooltip title={"Run"} placement="bottom" classes={{ tooltipPlacementRight: buttonClasses.tooltipPosition }}>
      <IconButton disabled={running} className={buttonClasses.iconWrapper} onClick={run}>
        <PlayCircleFilled className={classes.run} />
        {running && <CircularProgress className={classes.running} disableShrink size={theme.spacing(4)} />}
      </IconButton>
    </Tooltip>
  )
}
RunButton.propTypes = {
  running: PropTypes.bool.isRequired,
  run: PropTypes.func.isRequired,
}
