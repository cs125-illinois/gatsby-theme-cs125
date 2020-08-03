import React, { ReactNode, useState, useCallback } from "react"
import PropTypes from "prop-types"

import AppBar from "@material-ui/core/AppBar"
import Container from "@material-ui/core/Container"
import makeStyles from "@material-ui/core/styles/makeStyles"
import useTheme from "@material-ui/core/styles/useTheme"
import { Theme } from "@material-ui/core/styles/"
import Typography from "@material-ui/core/Typography"
import useMediaQuery from "@material-ui/core/useMediaQuery"
import Button from "@material-ui/core/Button"
import IconButton from "@material-ui/core/IconButton"
import Avatar from "@material-ui/core/Avatar"
import Dialog from "@material-ui/core/Dialog"
import DialogTitle from "@material-ui/core/DialogTitle"
import TextField from "@material-ui/core/TextField"

import { LoginButton } from "../react-google-login"

import Image, { FixedObject } from "gatsby-image"

import InvertColors from "@material-ui/icons/InvertColors"
import { useColorScheme } from "./ThemeProvider"
import { usePersonable } from "../personable/"
import gravatar from "gravatar"
import { useGoogleEmail } from "@cs125/react-google-login"

export const topBarHeight = (theme: Theme): number => theme.spacing(8)

const gravatarOptions = {
  r: "pg",
  d: encodeURI("https://cs125.cs.illinois.edu/img/logos/cs125-with-border-120x120.png"),
}

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

  const email = useGoogleEmail()
  const personable = usePersonable()
  const you = personable && personable.you
  const impersonate = personable && personable.impersonate
  const [impersonateOpen, setImpersonateOpen] = useState(false)

  const onKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLDivElement>) => {
      if (event.key !== "Enter") {
        return
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const value = (event.target as any).value as string
      impersonate && impersonate(value)
      setImpersonateOpen(false)
      event.preventDefault()
    },
    [impersonate]
  )

  return (
    <AppBar className={classes.top}>
      <Container maxWidth={"md"} className={classes.container}>
        {logo && <Image fadeIn={false} fixed={logo} className={classes.image} />}
        <Typography variant={"h3"} component={"div"} noWrap style={{ flex: 1 }}>
          <code>{title}</code>
        </Typography>
        {email && email === "challen@illinois.edu" && you && you.email && (
          <>
            <Button disableFocusRipple onClick={() => setImpersonateOpen(true)}>
              <Avatar src={gravatar.url(you.email, gravatarOptions)} />
            </Button>
            <Dialog open={impersonateOpen} onClose={() => setImpersonateOpen(false)}>
              <DialogTitle>Set user to impersonate</DialogTitle>
              <TextField variant="outlined" autoFocus={true} onKeyDown={onKeyDown} />
            </Dialog>
          </>
        )}
        <IconButton
          disableFocusRipple
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
