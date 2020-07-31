import React from "react"
import PropTypes from "prop-types"

import makeStyles from "@material-ui/core/styles/makeStyles"

import Tooltip from "@material-ui/core/Tooltip"
import Restore from "@material-ui/icons/Restore"
import grey from "@material-ui/core/colors/grey"
import { buttonStyles } from "./styles"
import { IAceEditor } from "react-ace/lib/types"

import { safeChangeValue } from "@cs125/monace"

const useStyles = makeStyles(theme => ({
  restore: {
    color: grey[500],
    fontSize: theme.spacing(2),
  },
}))

export const RestoreButton: React.FC<{ editor: IAceEditor; defaultValue: string }> = ({ editor, defaultValue }) => {
  const classes = useStyles()
  const buttonClasses = buttonStyles()
  return (
    <Tooltip title={"Restore"} placement="left" classes={{ tooltipPlacementLeft: buttonClasses.tooltipPosition }}>
      <div className={buttonClasses.iconWrapper} onClick={() => safeChangeValue(editor, defaultValue)}>
        <Restore className={classes.restore} />
      </div>
    </Tooltip>
  )
}
RestoreButton.propTypes = {
  editor: PropTypes.any.isRequired,
  defaultValue: PropTypes.string.isRequired,
}
