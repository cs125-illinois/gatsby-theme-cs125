import React, { useState, useCallback, useEffect } from "react"
import PropTypes from "prop-types"

import { useGoogleLogin } from "@cs125/react-google-login"

import { Button, ButtonProps, makeStyles, CircularProgress } from "@material-ui/core"
import { FaGoogle } from "react-icons/fa"
import { grey } from "@material-ui/core/colors"

const useStyles = makeStyles(theme => ({
  wrapper: {
    display: "inline-block",
    margin: theme.spacing(1),
    position: "relative",
  },
  right: {
    float: "right",
  },
  button: {
    width: "6rem",
    lineHeight: "normal",
    color: theme.palette.background.default,
    textTransform: "none",
    fontWeight: "bold",
    fontSize: "0.8rem",
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
  right?: boolean
}
export const LoginButton: React.FC<LoginButtonProps> = ({ right, ...props }) => {
  const { ready, auth, isSignedIn, err, lastLogin } = useGoogleLogin()
  const [busy, setBusy] = useState<boolean>(false)
  const classes = useStyles()

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
    content = <div>Error</div>
    disabled = true
  } else if ((!ready && lastLogin === undefined) || (ready && !isSignedIn)) {
    content = (
      <div>
        <FaGoogle style={{ marginBottom: -2 }} /> Login
      </div>
    )
    className = classes.success
  } else {
    content = <div>Logout</div>
    className = classes.logout
  }

  return (
    <div className={`${classes.wrapper} ${right && classes.right}`.trim()}>
      <Button
        variant={"contained"}
        disableElevation={className === classes.logout}
        disabled={disabled}
        className={`${classes.button} ${className}`}
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
      {loading && showLoading && <CircularProgress size={24} thickness={5} className={classes.loading} />}
    </div>
  )
}
LoginButton.propTypes = {
  right: PropTypes.bool,
}
LoginButton.defaultProps = {
  right: false,
}
