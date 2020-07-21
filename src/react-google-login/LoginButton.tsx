import React, { useCallback } from "react"
import PropTypes from "prop-types"

import { useGoogleLogin } from "@cs125/react-google-login"

import Button, { ButtonProps } from "@material-ui/core/Button"
import makeStyles from "@material-ui/core/styles/makeStyles"
import CircularProgress from "@material-ui/core/CircularProgress"
import useTheme from "@material-ui/core/styles/useTheme"

import Google from "mdi-material-ui/Google"
import Error from "@material-ui/icons/Error"
import ExitToApp from "@material-ui/icons/ExitToApp"

import grey from "@material-ui/core/colors/grey"

const useStyles = makeStyles(theme => ({
  wrapper: {
    display: "inline-block",
    position: "relative",
  },
  button: {
    width: "5rem",
    height: theme.spacing(4),
    lineHeight: "normal",
    color: theme.palette.background.default,
    textTransform: "none",
    fontWeight: "bold",
    fontSize: "0.8rem",
    padding: theme.spacing(1),
  },
  iconOnly: {
    width: "3rem",
    minWidth: "3rem",
    fontSize: theme.spacing(3),
  },
  icon: {
    marginBottom: -2,
  },
  success: {
    backgroundColor: theme.palette.success.main,
    "&:hover": {
      backgroundColor: theme.palette.success.light,
    },
  },
  logout: {
    backgroundColor: grey[500],
    "&:hover": {
      backgroundColor: grey[700],
    },
  },
  disabled: {
    backgroundColor: grey[500],
  },
  loading: {
    color: theme.palette.background.default,
    position: "absolute",
    top: "50%",
    left: "50%",
    marginTop: -12,
    marginLeft: -12,
  },
}))

export interface LoginButtonProps extends ButtonProps {
  iconOnly?: boolean
  loginText?: string
}
export const LoginButton: React.FC<LoginButtonProps> = ({ iconOnly = false, loginText = "Login", ...props }) => {
  const { ready, auth, isSignedIn, err, loggingIn, setLoggingIn } = useGoogleLogin()
  const classes = useStyles()
  const theme = useTheme()

  const loginOrOut = useCallback(
    (isSignedIn: boolean | undefined) => async (): Promise<void> => {
      if (!auth) {
        return
      }
      setLoggingIn(true)
      try {
        await (!isSignedIn ? auth.signIn() : auth.signOut())
      } finally {
        setLoggingIn(false)
      }
    },
    [auth, setLoggingIn]
  )

  let content,
    disabled = false,
    className
  if (err !== undefined) {
    content = iconOnly ? <Error /> : <div>Error</div>
    disabled = true
  } else if (!ready) {
    content = <div></div>
    disabled = true
  } else if (!isSignedIn) {
    content = iconOnly ? (
      <Google fontSize={"inherit"} />
    ) : (
      <div>
        <Google fontSize={"inherit"} className={classes.icon} /> <span>{loginText}</span>
      </div>
    )
    className = classes.success
  } else {
    content = iconOnly ? <ExitToApp fontSize={"inherit"} /> : <div>Logout</div>
    className = classes.logout
  }

  return (
    <div className={classes.wrapper}>
      <Button
        variant={"contained"}
        disableElevation={className === classes.logout}
        disabled={disabled}
        className={`${classes.button} ${className} ${iconOnly ? classes.iconOnly : ""}`.trim()}
        onClick={
          !err && ready && !loggingIn
            ? loginOrOut(isSignedIn)
            : (): void => {
                return
              }
        }
        {...props}
      >
        {content}
      </Button>
      {(loggingIn || (!ready && !err)) && (
        <CircularProgress size={theme.spacing(3)} thickness={5} className={classes.loading} />
      )}
    </div>
  )
}
LoginButton.propTypes = {
  iconOnly: PropTypes.bool,
  loginText: PropTypes.string,
}
LoginButton.defaultProps = {
  iconOnly: false,
  loginText: "Login",
}
