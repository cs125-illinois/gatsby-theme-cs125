import React, { useState, useCallback, useEffect } from "react"
import PropTypes from "prop-types"

import { useGoogleLogin } from "@cs125/react-google-login"

import { Button, ButtonProps, makeStyles, CircularProgress, useTheme } from "@material-ui/core"
import { Google } from "mdi-material-ui"
import { Error, ExitToApp } from "@material-ui/icons"

import { grey } from "@material-ui/core/colors"

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
}
export const LoginButton: React.FC<LoginButtonProps> = ({ iconOnly = false, ...props }) => {
  const { ready, auth, isSignedIn, err, lastLogin } = useGoogleLogin()
  const [busy, setBusy] = useState<boolean>(false)
  const classes = useStyles()
  const theme = useTheme()

  const loginOrOut = useCallback(
    (isSignedIn: boolean | undefined) => async (): Promise<void> => {
      if (!auth) {
        return
      }
      setBusy(true)
      try {
        await (!isSignedIn ? auth.signIn() : auth.signOut())
      } finally {
        setBusy(false)
      }
    },
    [auth, setBusy]
  )

  const [showLoading, setShowLoading] = useState<boolean>(false)
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowLoading(true)
    }, 1000)
    return () => {
      clearTimeout(timer)
    }
  }, [])

  const loading = !err && (!ready || busy)
  let content,
    disabled = false,
    className
  if (err !== undefined) {
    content = iconOnly ? <Error /> : <div>Error</div>
    disabled = true
  } else if ((!ready && lastLogin === undefined) || (ready && !isSignedIn)) {
    content = iconOnly ? (
      <Google fontSize={"inherit"} />
    ) : (
      <div>
        <Google fontSize={"inherit"} className={classes.icon} /> Login
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
          !err && ready && !busy
            ? loginOrOut(isSignedIn)
            : (): void => {
                return
              }
        }
        {...props}
      >
        {content}
      </Button>
      {loading && showLoading && <CircularProgress size={theme.spacing(3)} thickness={5} className={classes.loading} />}
    </div>
  )
}
LoginButton.propTypes = {
  iconOnly: PropTypes.bool,
}
LoginButton.defaultProps = {
  iconOnly: false,
}
