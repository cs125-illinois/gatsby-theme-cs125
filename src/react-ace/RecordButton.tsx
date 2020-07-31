import React from "react"
import PropTypes from "prop-types"

import useTheme from "@material-ui/core/styles/useTheme"
import makeStyles from "@material-ui/core/styles/makeStyles"

import Tooltip from "@material-ui/core/Tooltip"
import IconButton from "@material-ui/core/IconButton"
import Adjust from "@material-ui/icons/Adjust"
import CircularProgress from "@material-ui/core/CircularProgress"
import red from "@material-ui/core/colors/red"
import { buttonStyles } from "./styles"

const useStyles = makeStyles(theme => ({
  record: {
    color: red[700],
    fontSize: theme.spacing(4),
  },
  recording: {
    position: "absolute",
    bottom: 0,
    left: 0,
    color: red.A400,
  },
}))

export const RecordButton: React.FC<{ recording: boolean; toggle: () => void }> = ({ recording, toggle }) => {
  const theme = useTheme()
  const classes = useStyles()
  const buttonClasses = buttonStyles()
  return (
    <Tooltip title={"Record"} placement="bottom" classes={{ tooltipPlacementRight: buttonClasses.tooltipPosition }}>
      <IconButton className={buttonClasses.iconWrapper} onClick={toggle}>
        <Adjust className={classes.record} />
        {recording && <CircularProgress className={classes.recording} disableShrink size={theme.spacing(4)} />}
      </IconButton>
    </Tooltip>
  )
}
RecordButton.propTypes = {
  recording: PropTypes.bool.isRequired,
  toggle: PropTypes.func.isRequired,
}
