import React from "react"
import PropTypes from "prop-types"

import { ContainerProps, Container, makeStyles } from "@material-ui/core"

const useStyles = makeStyles(theme => ({
  root: {
    paddingTop: theme.spacing(10),
    paddingBottom: theme.spacing(2),
  },
}))

// eslint-disable-next-line react/prop-types,@typescript-eslint/no-unused-vars
export const MainContainer: React.FC<ContainerProps> = ({ maxWidth, children, ...props }) => {
  const classes = useStyles()
  return (
    // eslint-disable-next-line react/prop-types
    <Container className={`${classes.root} ${props.classes && props.classes}`.trim()} maxWidth={"md"} {...props}>
      {children}
    </Container>
  )
}
MainContainer.propTypes = {
  children: PropTypes.node.isRequired,
}
