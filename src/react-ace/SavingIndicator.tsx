import React from "react"
import PropTypes from "prop-types"

import useTheme from "@material-ui/core/styles/useTheme"
import makeStyles from "@material-ui/core/styles/makeStyles"

import Tooltip from "@material-ui/core/Tooltip"
import CheckCircle from "@material-ui/icons/CheckCircle"
import CircularProgress from "@material-ui/core/CircularProgress"
import green from "@material-ui/core/colors/green"
import { buttonStyles } from "./styles"

const useStyles = makeStyles(theme => ({
  save: {
    color: green[400],
    fontSize: theme.spacing(2),
  },
  saving: {
    position: "absolute",
    top: 2,
    left: 0,
    color: green.A700,
  },
}))

export const SavingIndicator: React.FC<{ saving: boolean }> = ({ saving }) => {
  const theme = useTheme()
  const classes = useStyles()
  const buttonClasses = buttonStyles()
  return (
    <Tooltip
      title={saving ? "Saving" : "Saved"}
      placement="right"
      classes={{ tooltipPlacementRight: buttonClasses.tooltipPosition }}
    >
      <div className={buttonClasses.iconWrapper}>
        <CheckCircle className={classes.save} />
        {saving && <CircularProgress className={classes.saving} disableShrink size={theme.spacing(2)} />}
      </div>
    </Tooltip>
  )
}
SavingIndicator.propTypes = {
  saving: PropTypes.bool.isRequired,
}
