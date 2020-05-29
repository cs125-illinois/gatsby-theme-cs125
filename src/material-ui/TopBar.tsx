import React, { ReactNode } from "react"
import PropTypes from "prop-types"

import { AppBar, Typography, Container, makeStyles } from "@material-ui/core"
import { LoginButton } from "src/react-google-login"

const useStyles = makeStyles(theme => ({
  top: {
    position: "fixed",
    backgroundColor: theme.palette.background.default,
    color: theme.palette.text.primary,
  },
}))

interface TopBarProps {
  title?: ReactNode
}
export const TopBar: React.FC<TopBarProps> = ({ title }) => {
  const classes = useStyles()
  return (
    <AppBar className={classes.top}>
      <Container maxWidth={"md"}>
        {title}
        <LoginButton right />
      </Container>
    </AppBar>
  )
}
TopBar.propTypes = {
  title: PropTypes.node,
}
TopBar.defaultProps = {
  title: (
    <Typography component="span" style={{ fontSize: "2rem", fontWeight: "bold" }}>
      <code>{process.env.npm_package_name}</code>
    </Typography>
  ),
}
