import React from "react"
import PropTypes from "prop-types"

import { makeStyles } from "@material-ui/core"

const useStyles = makeStyles(() => ({
  lead: {
    fontSize: "1.2em",
  },
}))

export const Lead: React.FC = ({ children }) => {
  const classes = useStyles()
  const elements = React.Children.toArray(children).map(element => {
    return React.cloneElement(element as React.ReactElement<HTMLParagraphElement>, { className: classes.lead })
  })
  return <>{elements}</>
}
Lead.propTypes = {
  children: PropTypes.any.isRequired,
}
