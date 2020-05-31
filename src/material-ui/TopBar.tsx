import React, { ReactNode } from "react"
import PropTypes from "prop-types"

import { AppBar, Container, makeStyles, Theme, Typography } from "@material-ui/core"
import { LoginButton } from "../react-google-login"

import Image, { FixedObject } from "gatsby-image"

export const topBarHeight = (theme: Theme): number => theme.spacing(8)

const useStyles = makeStyles(theme => ({
  top: {
    position: "fixed",
    backgroundColor: theme.palette.background.default,
    color: theme.palette.text.primary,
  },
  container: {
    height: topBarHeight(theme),
    display: "flex",
    alignItems: "center",
  },
  image: {
    height: theme.spacing(6),
    width: theme.spacing(6),
    marginRight: theme.spacing(2),
    flexShrink: 0,
  },
}))

interface TopBarProps {
  title: ReactNode
  logo?: FixedObject
}
export const TopBar: React.FC<TopBarProps> = ({ title, logo }) => {
  const classes = useStyles()

  return (
    <AppBar className={classes.top}>
      <Container maxWidth={"md"} className={classes.container}>
        {logo && <Image fadeIn={false} fixed={logo} className={classes.image} />}
        <Typography variant={"h3"} component={"div"} noWrap style={{ flex: 1 }}>
          <code>{title}</code>
        </Typography>
        <div style={{ flexShrink: 0 }}>
          <LoginButton style={{ flexShrink: 0 }} />
        </div>
      </Container>
    </AppBar>
  )
}
TopBar.propTypes = {
  title: PropTypes.node.isRequired,
  logo: PropTypes.any,
}
