import React, { ReactNode } from "react"
import PropTypes from "prop-types"

import AppBar from "@material-ui/core/AppBar"
import Container from "@material-ui/core/Container"
import makeStyles from "@material-ui/core/styles/makeStyles"
import useTheme from "@material-ui/core/styles/useTheme"
import { Theme } from "@material-ui/core/styles/"
import Typography from "@material-ui/core/Typography"
import useMediaQuery from "@material-ui/core/useMediaQuery"
import IconButton from "@material-ui/core/IconButton"

import { LoginButton } from "../react-google-login"

import Image, { FixedObject } from "gatsby-image"

import InvertColors from "@material-ui/icons/InvertColors"
import { useColorScheme } from "./ThemeProvider"

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
  const theme = useTheme()
  const { colorScheme, setColorScheme } = useColorScheme()
  const thin = useMediaQuery(theme.breakpoints.down("sm"))

  return (
    <AppBar className={classes.top}>
      <Container maxWidth={"md"} className={classes.container}>
        {logo && <Image fadeIn={false} fixed={logo} className={classes.image} />}
        <Typography variant={"h3"} component={"div"} noWrap style={{ flex: 1 }}>
          <code>{title}</code>
        </Typography>
        <IconButton
          onClick={(): void => {
            setColorScheme(colorScheme === "light" ? "dark" : "light")
          }}
        >
          <InvertColors />
        </IconButton>
        <LoginButton iconOnly={thin} />
      </Container>
    </AppBar>
  )
}
TopBar.propTypes = {
  title: PropTypes.node.isRequired,
  logo: PropTypes.any,
}
